// Rich text from the TipTap editor is sanitized here before it is stored,
// so the public site can render it with {@html} safely.
import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
	allowedTags: [
		'p', 'br', 'hr', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 's', 'u',
		'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel'],
		img: ['src', 'alt', 'title', 'width', 'height']
	},
	allowedSchemes: ['https', 'http', 'mailto', 'tel'],
	allowedSchemesByTag: { img: ['https'] },
	allowProtocolRelative: false,
	transformTags: {
		a: (tagName, attribs) => {
			const external = /^https?:\/\//i.test(attribs.href ?? '');
			return {
				tagName,
				attribs: external
					? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
					: { href: attribs.href ?? '', ...(attribs.title ? { title: attribs.title } : {}) }
			};
		}
	}
};

export function sanitizeRichText(html: string) {
	const clean = sanitizeHtml(html, options).trim();
	// An "empty" editor still produces <p></p>.
	return clean.replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/g, '').trim() ? clean : '';
}
