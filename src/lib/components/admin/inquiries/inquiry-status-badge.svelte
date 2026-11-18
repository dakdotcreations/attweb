<script lang="ts">
	import { statusMeta, type InquiryStatus } from '#lib/inquiries.js';
	import { cn } from '#lib/utils.js';

	let { status, class: className }: { status: InquiryStatus; class?: string } = $props();
</script>

<span
	class={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap', statusMeta[status].class, className)}
>
	{statusMeta[status].label}
</span>
