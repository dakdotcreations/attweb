import { randomUUID } from 'node:crypto';
import { db, type UserRole } from '../db.js';

export async function listUsers() {
	const users = await db.user.findMany({
		orderBy: [{ role: 'asc' }, { name: 'asc' }],
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			createdAt: true,
			sessions: { orderBy: { updatedAt: 'desc' }, take: 1, select: { updatedAt: true } }
		}
	});
	return users.map(({ sessions, ...u }) => ({ ...u, lastActiveAt: sessions[0]?.updatedAt ?? null }));
}

export function createUser(data: { name: string; email: string; role: UserRole }) {
	// emailVerified: the admin vouches for the address; OTP sign-in proves it on first login.
	return db.user.create({
		data: { id: randomUUID(), ...data, emailVerified: true },
		select: { id: true }
	});
}

export async function updateUser(id: string, data: { name: string; role: UserRole }) {
	return db.user.update({ where: { id }, data, select: { id: true } });
}

/** Deleting a user signs them out everywhere (sessions cascade). Their content stays. */
export function deleteUser(id: string) {
	return db.user.delete({ where: { id } });
}
