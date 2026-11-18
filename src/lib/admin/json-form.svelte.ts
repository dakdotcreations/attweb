// Client side of the JSON-payload form pattern used by dashboard content forms.
//
//   const form = new JsonForm(() => values);
//   <form method="POST" action="?/save" use:enhance={form.enhance}> ... form.errors.title ...
import type { SubmitFunction } from '$app/forms';

export type FieldErrors = Record<string, string>;

export class JsonForm<T> {
	submitting = $state(false);
	errors = $state<FieldErrors>({});
	message = $state<string | null>(null);
	/** True after a successful save until the next submit. */
	saved = $state(false);

	constructor(private getPayload: () => T) {}

	enhance: SubmitFunction = ({ formData, action }) => {
		// Only the save action carries the payload; other actions (delete) post their own fields.
		if (action.search.includes('save')) {
			formData.set('payload', JSON.stringify($state.snapshot(this.getPayload())));
		}
		this.submitting = true;
		this.saved = false;
		this.message = null;

		return async ({ result, update }) => {
			this.submitting = false;
			if (result.type === 'failure') {
				this.errors = (result.data?.errors as FieldErrors) ?? {};
				this.message = (result.data?.message as string) ?? 'Something went wrong.';
				return;
			}
			this.errors = {};
			if (result.type === 'success') this.saved = true;
			// Re-run loads with the saved data; follows redirects (e.g. create → edit page).
			await update({ reset: false });
		};
	};
}
