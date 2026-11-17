import { z } from 'zod';
import { publishStatusSchema, requiredText, sortOrderSchema } from './common.js';

/** An airline visitors can pick on the flight request form (also listed on the About page). */
export const airlineSchema = z.object({
	name: requiredText(80, 'Name'),
	status: publishStatusSchema,
	sortOrder: sortOrderSchema
});

export type AirlineInput = z.input<typeof airlineSchema>;
export type AirlineData = z.output<typeof airlineSchema>;
