<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Sign in · Altura</title>
</svelte:head>

<Card.Root>
	<Card.Header>
		<Card.Title>Sign in</Card.Title>
		<Card.Description>Enter your work email and we'll send you a sign-in code.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
			<Field.Group>
				<Field.Field data-invalid={form?.error ? true : undefined}>
					<Field.Label for="email">Email</Field.Label>
					<Input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						placeholder="you@alturatours.com"
						value={form?.email ?? ''}
						aria-invalid={form?.error ? true : undefined}
						required
					/>
					{#if form?.error}
						<Field.Error>{form.error}</Field.Error>
					{/if}
				</Field.Field>
				<Button type="submit" class="w-full" disabled={submitting}>
					{submitting ? 'Sending code…' : 'Send code'}
				</Button>
			</Field.Group>
		</form>
	</Card.Content>
</Card.Root>
