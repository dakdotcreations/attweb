<!-- Create (user = null) or edit a dashboard user. Posts to ?/create or ?/update. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';

	type Role = 'ADMIN' | 'EDITOR';
	type User = { id: string; name: string; email: string; role: Role };

	let {
		open = $bindable(false),
		user,
		isSelf = false,
		onDone
	}: { open?: boolean; user: User | null; isSelf?: boolean; onDone?: (message: string) => void } = $props();

	let role = $state<Role>('EDITOR');
	let sendInvite = $state(true);
	let submitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let message = $state<string | null>(null);

	$effect.pre(() => {
		if (!open) return;
		role = user?.role ?? 'EDITOR';
		sendInvite = true;
		errors = {};
		message = null;
	});

	const roles: Record<Role, { label: string; description: string }> = {
		ADMIN: { label: 'Admin', description: 'Everything, including users, settings and inquiries.' },
		EDITOR: { label: 'Editor', description: 'Services, packages, blog, testimonials and media.' }
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{user ? 'Edit user' : 'Add user'}</Dialog.Title>
			<Dialog.Description>
				{user ? user.email : 'They sign in with a one-time code sent to this email. No password needed.'}
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action={user ? '?/update' : '?/create'}
			use:enhance={() => {
				submitting = true;
				errors = {};
				message = null;
				return async ({ result, update }) => {
					submitting = false;
					if (result.type === 'failure') {
						errors = (result.data?.errors as Record<string, string>) ?? {};
						message = (result.data?.message as string) ?? null;
						return;
					}
					if (result.type === 'success') {
						const data = result.data ?? {};
						open = false;
						onDone?.(
							data.inviteFailed
								? 'User added, but the invite email could not be sent. Ask them to sign in at /auth/login.'
								: user
									? 'User updated.'
									: data.created && sendInvite
										? 'User added and invited by email.'
										: 'User added.'
						);
					}
					await update();
				};
			}}
		>
			{#if user}<input type="hidden" name="id" value={user.id} />{/if}
			<Field.Group>
				<Field.Field data-invalid={errors.name ? true : undefined}>
					<Field.Label for="user-name">Name</Field.Label>
					<Input id="user-name" name="name" value={user?.name ?? ''} maxlength={100} required />
					{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
				</Field.Field>
				{#if !user}
					<Field.Field data-invalid={errors.email ? true : undefined}>
						<Field.Label for="user-email">Email</Field.Label>
						<Input id="user-email" name="email" type="email" autocomplete="off" required />
						{#if errors.email}<Field.Error>{errors.email}</Field.Error>{/if}
					</Field.Field>
				{/if}
				<Field.Field data-invalid={errors.role ? true : undefined}>
					<Field.Label for="user-role">Role</Field.Label>
					<Select.Root type="single" name="role" bind:value={role} disabled={isSelf}>
						<Select.Trigger id="user-role" class="w-full">{roles[role].label}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(roles) as [value, r] (value)}
								<Select.Item {value} label={r.label} />
							{/each}
						</Select.Content>
					</Select.Root>
					<Field.Description>
						{isSelf ? "You can't change your own role." : roles[role].description}
					</Field.Description>
					{#if isSelf}<input type="hidden" name="role" value={role} />{/if}
					{#if errors.role}<Field.Error>{errors.role}</Field.Error>{/if}
				</Field.Field>
				{#if !user}
					<Field.Field orientation="horizontal">
						<Switch id="user-invite" name="sendInvite" value="on" bind:checked={sendInvite} />
						<Field.Label for="user-invite" class="font-normal">Email them a sign-in link</Field.Label>
					</Field.Field>
				{/if}
				{#if message && !Object.keys(errors).length}<p class="text-destructive text-sm">{message}</p>{/if}
			</Field.Group>
			<Dialog.Footer class="mt-6">
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Saving…' : user ? 'Save' : 'Add user'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
