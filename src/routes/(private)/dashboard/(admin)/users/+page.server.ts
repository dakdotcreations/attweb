import { BETTER_AUTH_URL } from '$app/env/private';
import { createUserSchema, updateUserSchema } from '#lib/schemas/users.js';
import { sendInviteEmail } from '#lib/server/email.js';
import { formFailure, isNotFound, isUniqueViolation, zodFieldErrors } from '#lib/server/forms.js';
import { requireAdmin } from '#lib/server/guards.js';
import { createUser, deleteUser, listUsers, updateUser } from '#lib/server/services/users.js';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const me = requireAdmin();
	return { users: await listUsers(), meId: me.id };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const me = requireAdmin();
		const form = await request.formData();
		const parsed = createUserSchema.safeParse({
			name: form.get('name') ?? '',
			email: form.get('email') ?? '',
			role: form.get('role') ?? '',
			sendInvite: form.get('sendInvite') === 'on'
		});
		if (!parsed.success) return formFailure(zodFieldErrors(parsed.error));

		const { sendInvite, ...data } = parsed.data;
		try {
			await createUser(data);
		} catch (err) {
			if (isUniqueViolation(err, 'email')) {
				return formFailure({ email: 'A user with this email already exists.' });
			}
			throw err;
		}

		if (sendInvite) {
			try {
				await sendInviteEmail(data.email, data.name, `${BETTER_AUTH_URL}/auth/login`, me.name || me.email);
			} catch (err) {
				console.error('Invite email failed', err);
				return { created: true, inviteFailed: true };
			}
		}
		return { created: true, inviteFailed: false };
	},

	update: async ({ request }) => {
		const me = requireAdmin();
		const form = await request.formData();
		const parsed = updateUserSchema.safeParse({
			id: form.get('id') ?? '',
			name: form.get('name') ?? '',
			role: form.get('role') ?? ''
		});
		if (!parsed.success) return formFailure(zodFieldErrors(parsed.error));

		const { id, ...data } = parsed.data;
		// Prevents locking everyone out: an admin can't demote themselves, so at least one admin remains.
		if (id === me.id && data.role !== 'ADMIN') {
			return formFailure({ role: 'You cannot remove your own admin role.' });
		}
		try {
			await updateUser(id, data);
		} catch (err) {
			if (isNotFound(err)) return fail(404, { errors: {}, message: 'This user no longer exists.' });
			throw err;
		}
		return { updated: true };
	},

	delete: async ({ request }) => {
		const me = requireAdmin();
		const id = String((await request.formData()).get('id') ?? '');
		if (!id) return fail(400, { errors: {}, message: 'Missing user.' });
		if (id === me.id) return fail(400, { errors: {}, message: 'You cannot delete your own account.' });
		try {
			await deleteUser(id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		return { deleted: true };
	}
};
