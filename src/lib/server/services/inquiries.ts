import { INQUIRY_STATUSES, type InquiryKind, type InquirySource, type InquiryStatus } from '#lib/inquiries.js';
import type { InquiryDetailsData } from '#lib/schemas/inquiries.js';
import { db } from '../db.js';
import type { Prisma } from '../generated/prisma/client.js';

export const INQUIRY_PAGE_SIZE = 25;

export type InquiryListParams = {
	status?: InquiryStatus;
	source?: InquirySource;
	kind?: InquiryKind;
	institutionId?: string;
	serviceId?: string;
	q?: string;
	page?: number;
};

function listWhere(params: Omit<InquiryListParams, 'status' | 'page'>): Prisma.InquiryWhereInput {
	const q = params.q?.trim();
	const numberMatch = q?.match(/^#?(\d{1,9})$/);
	return {
		...(params.source ? { source: params.source } : {}),
		...(params.kind ? { kind: params.kind } : {}),
		...(params.institutionId ? { institutions: { some: { institutionId: params.institutionId } } } : {}),
		...(params.serviceId
			? { OR: [{ serviceId: params.serviceId }, { package: { services: { some: { serviceId: params.serviceId } } } }] }
			: {}),
		...(q
			? {
					AND: [
						{
							OR: [
								...(numberMatch ? [{ number: Number(numberMatch[1]) }] : []),
								{ name: { contains: q, mode: 'insensitive' } },
								{ email: { contains: q, mode: 'insensitive' } },
								{ phone: { contains: q } },
								{ interest: { contains: q, mode: 'insensitive' } },
								{ message: { contains: q, mode: 'insensitive' } }
							]
						}
					]
				}
			: {})
	};
}

export async function listInquiries(params: InquiryListParams) {
	const page = Math.max(1, params.page ?? 1);
	const base = listWhere(params);
	const where: Prisma.InquiryWhereInput = { ...base, ...(params.status ? { status: params.status } : {}) };

	const [items, total, grouped] = await Promise.all([
		db.inquiry.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * INQUIRY_PAGE_SIZE,
			take: INQUIRY_PAGE_SIZE,
			select: {
				id: true,
				number: true,
				name: true,
				email: true,
				phone: true,
				country: true,
				interest: true,
				travelDate: true,
				groupSize: true,
				status: true,
				source: true,
				kind: true,
				createdAt: true,
				package: { select: { title: true } },
				service: { select: { name: true } }
			}
		}),
		db.inquiry.count({ where }),
		// Counts per status with the other filters applied, for the status tabs.
		db.inquiry.groupBy({ by: ['status'], where: base, _count: { _all: true } })
	]);

	const counts = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s, 0])) as Record<InquiryStatus, number>;
	for (const row of grouped) counts[row.status] = row._count._all;

	return {
		items,
		total,
		page,
		pageCount: Math.max(1, Math.ceil(total / INQUIRY_PAGE_SIZE)),
		counts,
		allCount: Object.values(counts).reduce((a, b) => a + b, 0)
	};
}

export function countNewInquiries() {
	return db.inquiry.count({ where: { status: 'NEW' } });
}

export function recentNewInquiries(take = 5) {
	return db.inquiry.findMany({
		where: { status: 'NEW' },
		orderBy: { createdAt: 'desc' },
		take,
		select: { id: true, number: true, name: true, interest: true, source: true, createdAt: true }
	});
}

export function getInquiry(id: string) {
	return db.inquiry.findUnique({
		where: { id },
		include: {
			package: { select: { id: true, title: true, slug: true } },
			service: { select: { id: true, name: true, slug: true } },
			createdBy: { select: { name: true, email: true } },
			institutions: { orderBy: { rank: 'asc' } },
			notes: {
				orderBy: { createdAt: 'desc' },
				include: { author: { select: { name: true, email: true } } }
			}
		}
	});
}

/** Fills `interest` from the package/service when staff leave it empty. */
async function withInterest(data: InquiryDetailsData) {
	if (data.interest) return data;
	if (data.packageId) {
		const pkg = await db.tourPackage.findUnique({ where: { id: data.packageId }, select: { title: true } });
		if (pkg) return { ...data, interest: pkg.title };
	}
	if (data.serviceId) {
		const service = await db.service.findUnique({ where: { id: data.serviceId }, select: { name: true } });
		if (service) return { ...data, interest: service.name };
	}
	return data;
}

export type InquiryInstitutionChoice = { institutionId: string; name: string; country: string };

/** Used by the dashboard (staff-logged leads) and the public forms (lib/server/services/public-inquiry.ts). */
export async function createInquiry(
	data: InquiryDetailsData & {
		sourceUrl?: string | null;
		kind?: InquiryKind;
		/** Kind-specific answers (see lib/schemas/inquiry-details.ts) */
		details?: Prisma.InputJsonValue;
		/** Study abroad choices, in rank order */
		institutions?: InquiryInstitutionChoice[];
	},
	createdById: string | null
) {
	const { institutions, ...fields } = data;
	return db.inquiry.create({
		data: {
			...(await withInterest(fields)),
			createdById,
			...(institutions?.length
				? { institutions: { create: institutions.map((choice, i) => ({ ...choice, rank: i + 1 })) } }
				: {})
		},
		select: { id: true, number: true }
	});
}

export async function updateInquiryDetails(id: string, data: InquiryDetailsData) {
	return db.inquiry.update({ where: { id }, data: await withInterest(data), select: { id: true } });
}

/** Changes status and records it on the timeline (with an optional note), atomically. */
export async function changeInquiryStatus(id: string, status: InquiryStatus, authorId: string, note: string) {
	return db.$transaction(async (tx) => {
		const current = await tx.inquiry.findUniqueOrThrow({ where: { id }, select: { status: true } });
		if (current.status === status) {
			if (note) await tx.inquiryNote.create({ data: { inquiryId: id, authorId, body: note } });
			return { changed: false };
		}
		await tx.inquiry.update({ where: { id }, data: { status } });
		await tx.inquiryNote.create({
			data: {
				inquiryId: id,
				authorId,
				kind: 'STATUS_CHANGE',
				fromStatus: current.status,
				toStatus: status,
				body: note
			}
		});
		return { changed: true };
	});
}

export async function addInquiryNote(id: string, body: string, authorId: string) {
	// Touch the inquiry so "updated" reflects recent activity.
	return db.$transaction([
		db.inquiryNote.create({ data: { inquiryId: id, authorId, body } }),
		db.inquiry.update({ where: { id }, data: { updatedAt: new Date() } })
	]);
}

export function deleteInquiry(id: string) {
	return db.inquiry.delete({ where: { id } });
}
