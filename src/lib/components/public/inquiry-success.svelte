<!-- Thank-you panel shown after any public inquiry form is sent: a RECEIVED postmark, the reference and WhatsApp. -->
<script lang="ts">
	import Postmark from './postmark.svelte';
	import WhatsAppButton from './whatsapp-button.svelte';

	let {
		number,
		whatsappNumber,
		text = 'A member of our team will get back to you with options and prices.',
		againLabel = 'Send another message',
		onagain
	}: {
		number: number | null;
		whatsappNumber: string | null;
		text?: string;
		againLabel?: string;
		onagain: () => void;
	} = $props();

	/** Date on the RECEIVED postmark, e.g. "11 NOV 26" (fits inside the inner ring). */
	const receivedOn = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date()).toUpperCase();
</script>

<div class="rounded-md bg-white p-8 text-center ring-1 ring-forest-950/10 sm:p-10" role="status">
	<!-- The inquiry is cancelled like a letter: RECEIVED, Kampala, today's date. -->
	<Postmark
		place="RECEIVED"
		line="KAMPALA"
		date={receivedOn}
		label="Received in Kampala on {receivedOn}"
		class="received-stamp text-forest-800 mx-auto w-64 -rotate-6"
	/>
	<h3 class="font-display text-forest-950 mt-6 text-3xl font-semibold uppercase">Thank you, we've got it</h3>
	<p class="text-ink/70 mx-auto mt-3 max-w-md">
		{#if number}Your reference is <strong class="text-forest-900">#{number}</strong>.{/if}
		{text}
	</p>
	<div class="mt-6 flex flex-wrap justify-center gap-3">
		<WhatsAppButton
			number={whatsappNumber}
			message={number ? `Hi Altura, about my inquiry #${number}` : undefined}
			label="Need us sooner? WhatsApp"
		/>
		<button type="button" class="text-forest-800 hover:text-forest-600 rounded-full px-5 py-2.5 text-sm font-bold" onclick={onagain}>
			{againLabel}
		</button>
	</div>
</div>

<style>
	/* The RECEIVED cancel lands like a hand stamp (scale only; the rotate utility is separate). */
	@media (prefers-reduced-motion: no-preference) {
		:global(.received-stamp) {
			animation: received-land 0.55s cubic-bezier(0.2, 0.9, 0.2, 1) both;
		}
	}
	@keyframes received-land {
		from {
			opacity: 0;
			scale: 1.35;
		}
		to {
			opacity: 1;
			scale: 1;
		}
	}
</style>
