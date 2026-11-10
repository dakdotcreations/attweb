// Moves an element to <body>, e.g. fixed bars that must escape the ScrollSmoother
// wrapper (transforms there break `position: fixed`).
//   <div {@attach portal}>…</div>
import type { Attachment } from 'svelte/attachments';

export const portal: Attachment<HTMLElement> = (node) => {
	document.body.appendChild(node);
	return () => node.remove();
};
