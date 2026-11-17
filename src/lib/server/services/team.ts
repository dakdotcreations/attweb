import type { TeamMemberData } from '#lib/schemas/team.js';
import { db } from '../db.js';
import { mediaRefSelect } from './services.js';

const order = [{ sortOrder: 'asc' }, { name: 'asc' }] as const;

export function listTeamMembers() {
	return db.teamMember.findMany({
		orderBy: [...order],
		select: {
			id: true,
			name: true,
			role: true,
			status: true,
			sortOrder: true,
			updatedAt: true,
			photo: { select: mediaRefSelect }
		}
	});
}

export function getTeamMember(id: string) {
	return db.teamMember.findUnique({ where: { id }, include: { photo: { select: mediaRefSelect } } });
}

export function saveTeamMember(id: string | null, data: TeamMemberData) {
	if (id) return db.teamMember.update({ where: { id }, data, select: { id: true } });
	return db.teamMember.create({ data, select: { id: true } });
}

export function deleteTeamMember(id: string) {
	return db.teamMember.delete({ where: { id } });
}

/** Published members for the About page. Members without a photo are left out. */
export function listPublishedTeam() {
	return db.teamMember.findMany({
		where: { status: 'PUBLISHED', photoId: { not: null } },
		orderBy: [...order],
		select: { id: true, name: true, role: true, whatsapp: true, photo: { select: { url: true, alt: true } } }
	});
}
