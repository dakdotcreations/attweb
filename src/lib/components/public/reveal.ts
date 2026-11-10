// Scroll-triggered fade-up for public sections, as a Svelte attachment:
//   <ul {@attach reveal({ selector: '[data-reveal]', stagger: 0.1 })}>
// Content is fully visible until GSAP loads (never hidden by CSS), and nothing animates
// for visitors who prefer reduced motion.
import { loadGsap, prefersReducedMotion } from '#lib/hooks/UseGsap.svelte.js';
import type { Attachment } from 'svelte/attachments';

type RevealOptions = {
	/** Animate these descendants instead of the element itself. */
	selector?: string;
	y?: number;
	stagger?: number;
	delay?: number;
	/** ScrollTrigger start, default "top 85%". */
	start?: string;
};

export function reveal(options: RevealOptions = {}): Attachment<HTMLElement> {
	return (node) => {
		if (prefersReducedMotion()) return;
		let dead = false;
		let tween: gsap.core.Tween | undefined;

		loadGsap().then(({ gsap }) => {
			if (dead) return;
			const targets = options.selector ? node.querySelectorAll(options.selector) : node;
			tween = gsap.from(targets, {
				y: options.y ?? 36,
				opacity: 0,
				duration: 1,
				ease: 'power3.out',
				stagger: options.stagger ?? 0.1,
				delay: options.delay ?? 0,
				clearProps: 'transform,opacity',
				scrollTrigger: { trigger: node, start: options.start ?? 'top 85%', once: true }
			});
		});

		return () => {
			dead = true;
			tween?.scrollTrigger?.kill();
			tween?.revert();
		};
	};
}
