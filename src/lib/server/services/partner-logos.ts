import { db } from '../db.js';

export type PartnerLogo = { key: string; name: string; src: string };

const published = { status: 'PUBLISHED', logoId: { not: null } } as const;
const order = [{ sortOrder: 'asc' }, { name: 'asc' }] as const;
const select = { id: true, name: true, logo: { select: { thumbUrl: true } } } as const;

/**
 * Logos of everyone Altura works with, for the About page strip: published airlines,
 * partner institutions and medical partners that have a logo. Interleaved so one kind
 * doesn't fill the whole strip.
 */
export async function listPartnerLogos(): Promise<PartnerLogo[]> {
	const [airlines, institutions, medical] = await Promise.all([
		db.airline.findMany({ where: published, orderBy: [...order], select }),
		db.partnerInstitution.findMany({ where: published, orderBy: [...order], select }),
		db.medicalPartner.findMany({ where: published, orderBy: [...order], select })
	]);
	const groups = [
		airlines.map((a) => ({ key: `airline-${a.id}`, name: a.name, src: a.logo?.thumbUrl })),
		medical.map((m) => ({ key: `medical-${m.id}`, name: m.name, src: m.logo?.thumbUrl })),
		institutions.map((i) => ({ key: `institution-${i.id}`, name: i.name, src: i.logo?.thumbUrl }))
	];
	const logos: PartnerLogo[] = [];
	for (let i = 0; i < Math.max(...groups.map((g) => g.length)); i++) {
		for (const group of groups) {
			const logo = group[i];
			if (logo?.src) logos.push({ key: logo.key, name: logo.name, src: logo.src });
		}
	}
	return logos;
}
