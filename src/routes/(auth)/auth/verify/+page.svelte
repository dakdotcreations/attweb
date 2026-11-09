<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as InputOTP from '#lib/components/ui/input-otp/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let otp = $state('');
	let submitting = $state(false);
	let verifyForm = $state<HTMLFormElement>();

	const trackSubmit: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	};
</script>

<svelte:head>
	<title>Enter code · Altura</title>
</svelte:head>

<Card.Root>
	<Card.Header>
		<Card.Title>Check your email</Card.Title>
		<Card.Description>
			If <span class="text-foreground font-medium">{data.email}</span> has an account, we've sent it
			a 6-digit code.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" action="?/verify" bind:this={verifyForm} use:enhance={trackSubmit}>
			<input type="hidden" name="email" value={data.email} />
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
			<Field.Group>
				<Field.Field data-invalid={form?.error ? true : undefined}>
					<Field.Label for="otp">Sign-in code</Field.Label>
					<InputOTP.Root
						id="otp"
						name="otp"
						maxlength={6}
						inputmode="numeric"
						pattern="^\d+$"
						autocomplete="one-time-code"
						bind:value={otp}
						onComplete={() => verifyForm?.requestSubmit()}
					>
						{#snippet children({ cells })}
							<InputOTP.Group>
								{#each cells as cell (cell)}
									<InputOTP.Slot {cell} aria-invalid={form?.error ? true : undefined} />
								{/each}
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
					{#if form?.error}
						<Field.Error>{form.error}</Field.Error>
					{:else if form?.resent}
						<Field.Description>A new code is on its way.</Field.Description>
					{/if}
				</Field.Field>
				<Button type="submit" class="w-full" disabled={submitting || otp.length < 6}>
					{submitting ? 'Verifying…' : 'Verify and sign in'}
				</Button>
			</Field.Group>
		</form>
	</Card.Content>
	<Card.Footer class="text-muted-foreground flex justify-between text-sm">
		<a href="/auth/login" class="hover:text-foreground underline-offset-4 hover:underline">
			Use a different email
		</a>
		<form method="POST" action="?/resend" use:enhance>
			<input type="hidden" name="email" value={data.email} />
			<button type="submit" class="hover:text-foreground underline-offset-4 hover:underline">
				Resend code
			</button>
		</form>
	</Card.Footer>
</Card.Root>
