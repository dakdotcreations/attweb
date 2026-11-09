<!--
	TipTap rich text editor. `value` is HTML; the server sanitizes it on save
	(lib/server/sanitize.ts), so keep the toolbar in line with the allowed tags there.
-->
<script lang="ts">
	import MediaPicker from '#lib/components/admin/media/media-picker.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { cn } from '#lib/utils.js';
	import BoldIcon from '@lucide/svelte/icons/bold';
	import Heading2Icon from '@lucide/svelte/icons/heading-2';
	import Heading3Icon from '@lucide/svelte/icons/heading-3';
	import ImageIcon from '@lucide/svelte/icons/image';
	import ItalicIcon from '@lucide/svelte/icons/italic';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ListIcon from '@lucide/svelte/icons/list';
	import ListOrderedIcon from '@lucide/svelte/icons/list-ordered';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import Redo2Icon from '@lucide/svelte/icons/redo-2';
	import Undo2Icon from '@lucide/svelte/icons/undo-2';
	import { Editor } from '@tiptap/core';
	import Image from '@tiptap/extension-image';
	import StarterKit from '@tiptap/starter-kit';
	import { untrack } from 'svelte';

	let {
		value = $bindable(''),
		invalid = false,
		minHeight = '16rem'
	}: { value?: string; invalid?: boolean; minHeight?: string } = $props();

	let element = $state<HTMLDivElement>();
	let editor = $state.raw<Editor>();
	// Bumped on every editor transaction so toolbar active/disabled states re-render.
	let version = $state(0);
	let linkOpen = $state(false);
	let linkUrl = $state('');
	let pickerOpen = $state(false);

	$effect(() => {
		if (!element) return;
		const instance = new Editor({
			element,
			extensions: [
				StarterKit.configure({
					heading: { levels: [2, 3, 4] },
					code: false,
					codeBlock: false,
					link: { openOnClick: false, autolink: true, defaultProtocol: 'https' }
				}),
				Image
			],
			content: untrack(() => value),
			editorProps: {
				attributes: {
					class: 'prose prose-stone dark:prose-invert max-w-none px-4 py-3 focus:outline-none',
					style: `min-height: ${minHeight}`
				}
			},
			onTransaction: () => version++,
			onUpdate: ({ editor }) => {
				value = editor.isEmpty ? '' : editor.getHTML();
			}
		});
		editor = instance;
		return () => instance.destroy();
	});

	const toolbar = $derived.by(() => {
		void version;
		const e = editor;
		return {
			bold: e?.isActive('bold') ?? false,
			italic: e?.isActive('italic') ?? false,
			h2: e?.isActive('heading', { level: 2 }) ?? false,
			h3: e?.isActive('heading', { level: 3 }) ?? false,
			bullet: e?.isActive('bulletList') ?? false,
			ordered: e?.isActive('orderedList') ?? false,
			quote: e?.isActive('blockquote') ?? false,
			link: e?.isActive('link') ?? false,
			canUndo: e?.can().undo() ?? false,
			canRedo: e?.can().redo() ?? false
		};
	});

	function openLink() {
		linkUrl = (editor?.getAttributes('link').href as string | undefined) ?? '';
		linkOpen = true;
	}

	function applyLink() {
		const url = linkUrl.trim();
		const chain = editor?.chain().focus().extendMarkRange('link');
		if (!url) chain?.unsetLink().run();
		else chain?.setLink({ href: url }).run();
		linkOpen = false;
	}
</script>

{#snippet tool(label: string, active: boolean, onclick: () => void, Icon: typeof BoldIcon, disabled = false)}
	<Button
		type="button"
		variant={active ? 'secondary' : 'ghost'}
		size="icon-sm"
		aria-label={label}
		aria-pressed={active}
		title={label}
		{disabled}
		{onclick}
	>
		<Icon />
	</Button>
{/snippet}

<div
	class={cn(
		'bg-background focus-within:ring-ring/50 rounded-lg border focus-within:ring-[3px]',
		invalid && 'border-destructive'
	)}
>
	<div class="flex flex-wrap items-center gap-0.5 border-b p-1">
		{@render tool('Bold', toolbar.bold, () => editor?.chain().focus().toggleBold().run(), BoldIcon)}
		{@render tool('Italic', toolbar.italic, () => editor?.chain().focus().toggleItalic().run(), ItalicIcon)}
		<span class="bg-border mx-1 h-5 w-px"></span>
		{@render tool('Heading', toolbar.h2, () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), Heading2Icon)}
		{@render tool('Subheading', toolbar.h3, () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), Heading3Icon)}
		<span class="bg-border mx-1 h-5 w-px"></span>
		{@render tool('Bullet list', toolbar.bullet, () => editor?.chain().focus().toggleBulletList().run(), ListIcon)}
		{@render tool('Numbered list', toolbar.ordered, () => editor?.chain().focus().toggleOrderedList().run(), ListOrderedIcon)}
		{@render tool('Quote', toolbar.quote, () => editor?.chain().focus().toggleBlockquote().run(), QuoteIcon)}
		{@render tool('Divider', false, () => editor?.chain().focus().setHorizontalRule().run(), MinusIcon)}
		<span class="bg-border mx-1 h-5 w-px"></span>
		{@render tool('Link', toolbar.link, openLink, LinkIcon)}
		{@render tool('Insert image', false, () => (pickerOpen = true), ImageIcon)}
		<span class="ml-auto"></span>
		{@render tool('Undo', false, () => editor?.chain().focus().undo().run(), Undo2Icon, !toolbar.canUndo)}
		{@render tool('Redo', false, () => editor?.chain().focus().redo().run(), Redo2Icon, !toolbar.canRedo)}
	</div>

	{#if linkOpen}
		<div class="flex items-center gap-2 border-b p-2">
			<Input
				type="url"
				placeholder="https://example.com or /tours/gorilla-trekking"
				bind:value={linkUrl}
				class="h-8"
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						applyLink();
					}
					if (e.key === 'Escape') linkOpen = false;
				}}
			/>
			<Button type="button" size="sm" onclick={applyLink}>{linkUrl.trim() ? 'Apply' : 'Remove link'}</Button>
			<Button type="button" size="sm" variant="ghost" onclick={() => (linkOpen = false)}>Cancel</Button>
		</div>
	{/if}

	<div bind:this={element}></div>
</div>

<MediaPicker
	bind:open={pickerOpen}
	title="Insert image"
	onSelect={([item]) => {
		if (item) editor?.chain().focus().setImage({ src: item.url, alt: item.alt }).run();
	}}
/>
