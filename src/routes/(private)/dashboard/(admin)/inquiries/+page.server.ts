import { INQUIRY_SOURCES, INQUIRY_STATUSES, type InquirySource, type InquiryStatus } from '#lib/inquiries.js';
import { requireAdmin } from '#lib/server/guards.js';
import { listInquiries } from '#lib/server/services/inquiries.js';
import { listServiceOptions } from '#lib/server/services/services.js';
import type { PageServerLoad } from './$types';

const pick = <T extends string>(value: string | null, allowed: readonly T[]) =>
	allowed.includes(value as T) ? (value as T) : undefined;

export const load: PageServerLoad = async ({ url }) => {
	requireAdmin();
	const p = url.searchParams;
	const filters = {
		status: pick<InquiryStatus>(p.get('status'), INQUIRY_STATUSES),
		source: pick<InquirySource>(p.get('source'), INQUIRY_SOURCES),
		serviceId: p.get('service') || undefined,
		q: p.get('q')?.slice(0, 100) || undefined,
		page: Math.max(1, Number(p.get('page')) || 1)
	};
	const [result, services] = await Promise.all([listInquiries(filters), listServiceOptions()]);
	return {
		...result,
		services,
		filters: {
			status: filters.status ?? '',
			source: filters.source ?? '',
			serviceId: filters.serviceId ?? '',
			q: filters.q ?? ''
		}
	};
};
