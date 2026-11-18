import type { SettingsData } from '#lib/schemas/settings.js';
import { db } from '../db.js';
import { mediaRefSelect } from './services.js';

const SETTINGS_ID = 1;

/** The single settings row, created with defaults on first read. */
export function getSettings() {
	return db.siteSettings.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID },
		update: {},
		include: { ogImage: { select: mediaRefSelect } }
	});
}

export function saveSettings(data: SettingsData) {
	return db.siteSettings.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...data },
		update: data
	});
}
