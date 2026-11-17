import { z } from 'zod';
import { mediaIdSchema, publishStatusSchema, requiredText, sortOrderSchema } from './common.js';

/** An airline visitors can pick on the flight request form; its logo also runs in the About page logo strip. */
export const airlineSchema = z.object({
	name: requiredText(80, 'Name'),
	logoId: mediaIdSchema,
	status: publishStatusSchema,
	sortOrder: sortOrderSchema
});

export type AirlineInput = z.input<typeof airlineSchema>;
export type AirlineData = z.output<typeof airlineSchema>;
