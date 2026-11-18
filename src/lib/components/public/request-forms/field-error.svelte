<script lang="ts">
	let { id, message }: { id: string; message: string | undefined } = $props();
</script>

{#if message}<p {id} class="text-crane-red mt-1.5 text-xs font-semibold">{message}</p>{/if}
