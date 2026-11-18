import { settingsSchema } from '#lib/schemas/settings.js';
import { formFailure, isForeignKeyViolation, parseJsonPayload } from '#lib/server/forms.js';
import { requireAdmin } from '#lib/server/guards.js';
import { getSettings, saveSettings } from '#lib/server/services/settings.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	requireAdmin();
	return { settings: await getSettings() };
};

export const actions: Actions = {
	save: async ({ request }) => {
		requireAdmin();
		const parsed = await parseJsonPayload(request, settingsSchema);
		if (!parsed.ok) return parsed.failure;
		try {
			await saveSettings(parsed.data);
		} catch (err) {
			if (isForeignKeyViolation(err)) {
				return formFailure({}, 'The selected sharing image no longer exists. Choose another one.');
			}
			throw err;
		}
		return { saved: true };
	}
};
