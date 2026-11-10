import { onMount } from 'svelte';

// GSAP 3.13+ ships ScrollTrigger, ScrollSmoother and SplitText free in the public `gsap` package.
type Gsap = typeof import('gsap').gsap;
type ScrollTriggerStatic = typeof import('gsap/ScrollTrigger').ScrollTrigger;
type ScrollSmootherStatic = typeof import('gsap/ScrollSmoother').ScrollSmoother;
type SplitTextStatic = typeof import('gsap/SplitText').SplitText;

export type GsapModules = {
	gsap: Gsap;
	ScrollTrigger: ScrollTriggerStatic;
	ScrollSmoother: ScrollSmootherStatic;
	SplitText: SplitTextStatic;
	/** True when the visitor asked the OS for reduced motion: skip or simplify animations. */
	reducedMotion: boolean;
};

type LoadedModules = Omit<GsapModules, 'reducedMotion'>;

let gsapPromise: Promise<LoadedModules> | null = null;

/** Loads GSAP and its plugins once (browser only), registering the plugins. */
export function loadGsap(): Promise<LoadedModules> {
	gsapPromise ??= (async () => {
		const [gsapModule, scrollTriggerModule, scrollSmootherModule, splitTextModule] = await Promise.all([
			import('gsap'),
			import('gsap/ScrollTrigger'),
			import('gsap/ScrollSmoother'),
			import('gsap/SplitText')
		]);
		const gsap = gsapModule.gsap ?? gsapModule.default;
		const { ScrollTrigger } = scrollTriggerModule;
		const { ScrollSmoother } = scrollSmootherModule;
		const { SplitText } = splitTextModule;
		// ScrollSmoother depends on ScrollTrigger being registered with it.
		gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
		return { gsap, ScrollTrigger, ScrollSmoother, SplitText };
	})();
	return gsapPromise;
}

export function prefersReducedMotion() {
	return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type ScopeValue = Element | string | null | undefined;
/** A selector/element, or a getter so `bind:this` elements (undefined at call time) work. */
type Scope = ScopeValue | (() => ScopeValue);

/**
 * Runs `setup` once GSAP has loaded on the client, inside a gsap.context scoped to `scope`.
 * Everything created in setup (tweens, ScrollTriggers, ScrollSmoother, SplitText) is reverted
 * when the component unmounts. If the component unmounts before GSAP finishes loading,
 * setup never runs.
 *
 *   let root = $state<HTMLElement>();
 *   useGsap(({ gsap, reducedMotion }) => { if (!reducedMotion) gsap.from('.title', { y: 20 }) }, () => root);
 */
export function useGsap(setup: (deps: GsapModules) => (() => void) | void, scope?: Scope) {
	onMount(() => {
		let destroyed = false;
		let ctx: gsap.Context | undefined;
		let userCleanup: (() => void) | void;

		loadGsap().then((modules) => {
			if (destroyed) return;
			const target = typeof scope === 'function' ? scope() : scope;
			ctx = modules.gsap.context(() => {
				userCleanup = setup({ ...modules, reducedMotion: prefersReducedMotion() });
			}, target ?? undefined);
			modules.ScrollTrigger.refresh();
		});

		return () => {
			destroyed = true;
			userCleanup?.();
			ctx?.revert(); // also kills ScrollTriggers / ScrollSmoother created inside the context
		};
	});
}
