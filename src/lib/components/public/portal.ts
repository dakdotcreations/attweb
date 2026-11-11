// Moves an element to <body>, e.g. fixed bars that must escape the ScrollSmoother
// wrapper (transforms there break `position: fixed`).
//   <div class="contents"><div {@attach portal}>…</div></div>
// Always wrap the portaled element: if it is the first or last node of a component, Svelte's
// unmount walks past its old position and removes the next page's content as well.
import type { Attachment } from 'svelte/attachments';

export const portal: Attachment<HTMLElement> = (node) => {
	document.body.appendChild(node);
	return () => node.remove();
};
