<!-- Confirmed delete that posts to the page's `?/delete` action. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	let {
		title,
		description,
		label = 'Delete',
		action = '?/delete',
		fields = {}
	}: {
		title: string;
		description: string;
		label?: string;
		action?: string;
		/** Extra hidden fields to send (e.g. { id }) */
		fields?: Record<string, string>;
	} = $props();

	let open = $state(false);
	let deleting = $state(false);
	let error = $state<string | null>(null);
</script>

<Button type="button" variant="outline" class="text-destructive" onclick={() => (open = true)}>
	<TrashIcon data-icon="inline-start" />
	{label}
</Button>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			<AlertDialog.Description>{description}</AlertDialog.Description>
		</AlertDialog.Header>
		{#if error}<p class="text-destructive text-sm">{error}</p>{/if}
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				method="POST"
				{action}
				use:enhance={() => {
					deleting = true;
					error = null;
					return async ({ result, update }) => {
						deleting = false;
						if (result.type === 'failure') {
							error = (result.data?.message as string) ?? 'Could not delete.';
							return;
						}
						open = false;
						await update();
					};
				}}
			>
				{#each Object.entries(fields) as [name, value] (name)}
					<input type="hidden" {name} {value} />
				{/each}
				<button type="submit" class={buttonVariants({ variant: 'destructive' })} disabled={deleting}>
					{deleting ? 'Deleting…' : label}
				</button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
