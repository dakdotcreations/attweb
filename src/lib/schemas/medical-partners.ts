import { z } from 'zod';
import { mediaIdSchema, publishStatusSchema, requiredText, sortOrderSchema } from './common.js';

/** A hospital, clinic or medical institution visitors can choose on the medical tourism request form. */
export const medicalPartnerSchema = z.object({
	name: requiredText(150, 'Name'),
	country: requiredText(80, 'Country'),
	logoId: mediaIdSchema,
	status: publishStatusSchema,
	sortOrder: sortOrderSchema
});

export type MedicalPartnerInput = z.input<typeof medicalPartnerSchema>;
export type MedicalPartnerData = z.output<typeof medicalPartnerSchema>;
