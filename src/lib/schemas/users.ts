import { z } from 'zod';
import { emailSchema } from './auth.js';
import { requiredText } from './common.js';

export const userRoleSchema = z.enum(['ADMIN', 'EDITOR'], 'Choose a role');

export const createUserSchema = z.object({
	name: requiredText(100, 'Name'),
	email: emailSchema,
	role: userRoleSchema,
	sendInvite: z.boolean()
});

export const updateUserSchema = z.object({
	id: z.string().min(1),
	name: requiredText(100, 'Name'),
	role: userRoleSchema
});
