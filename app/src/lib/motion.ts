/**
 * Svelte actions & helpers built on top of `motion/mini` (DOM-only, no React).
 * Usage: <div use:fadeUp> or <div use:staggerChildren>
 */
import { animate } from 'motion';

type FadeUpOpts = { delay?: number; duration?: number; y?: number };
type FadeInOpts = { delay?: number; duration?: number };
type ScaleInOpts = { delay?: number; duration?: number; scale?: number };
type StaggerOpts = { delay?: number; stagger?: number; y?: number; duration?: number };
type NumberAnimOpts = { duration?: number; delay?: number };

const spring: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fade + slide up on mount */
export function fadeUp(node: HTMLElement, opts: FadeUpOpts = {}) {
	const { delay = 0, duration = 0.5, y = 12 } = opts;
	const a = animate(
		node,
		{
			opacity: [0, 1],
			y: [y, 0]
		},
		{ duration, delay, ease: [0.16, 1, 0.3, 1] }
	);
	const finished = (a as any).finished || a;
	if (finished && typeof (finished as any).then === 'function') {
		(finished as any).then(() => {
			node.style.opacity = '';
			node.style.transform = '';
		});
	}
}

/** Simple fade in */
export function fadeIn(node: HTMLElement, opts: FadeInOpts = {}) {
	const { delay = 0, duration = 0.4 } = opts;
	const a = animate(node, { opacity: [0, 1] }, { duration, delay, ease: 'easeOut' });
	const finished = (a as any).finished || a;
	if (finished && typeof (finished as any).then === 'function') {
		(finished as any).then(() => {
			node.style.opacity = '';
		});
	}
}

/** Scale + fade in */
export function scaleIn(node: HTMLElement, opts: ScaleInOpts = {}) {
	const { delay = 0, duration = 0.4, scale = 0.95 } = opts;
	animate(node, { opacity: [0, 1], scale: [scale, 1] }, { duration, delay, ease: spring });
}

/** Slide in from left */
export function slideInLeft(node: HTMLElement, opts: FadeUpOpts = {}) {
	const { delay = 0, duration = 0.4 } = opts;
	animate(node, { opacity: [0, 1], x: [-24, 0] }, { duration, delay, ease: spring });
}

/** Stagger children on mount */
export function staggerChildren(node: HTMLElement, opts: StaggerOpts = {}) {
	const { delay = 0, stagger = 0.05, y = 10, duration = 0.5 } = opts;
	const children = Array.from(node.children) as HTMLElement[];

	children.forEach((child, i) => {
		const a = animate(
			child,
			{
				opacity: [0, 1],
				y: [y, 0]
			},
			{
				duration,
				delay: delay + i * stagger,
				ease: [0.16, 1, 0.3, 1]
			}
		);

		const finished = (a as any).finished || a;
		if (finished && typeof (finished as any).then === 'function') {
			(finished as any).then(() => {
				child.style.opacity = '';
				child.style.transform = '';
			});
		}
	});
}

/** Pop / scale-bounce in */
export function popIn(node: HTMLElement, opts: ScaleInOpts = {}) {
	const { delay = 0, duration = 0.5 } = opts;
	animate(node, { opacity: [0, 1], scale: [0.7, 1.06, 1] }, { duration, delay, ease: spring });
}

type InViewOpts = { delay?: number; duration?: number; y?: number; threshold?: number };
type InViewStaggerOpts = InViewOpts & { stagger?: number };
type FloatOpts = { duration?: number; y?: number; delay?: number };

/** Reveal on scroll into view (one-shot) */
export function inView(node: HTMLElement, opts: InViewOpts = {}) {
	const { delay = 0, duration = 0.55, y = 24, threshold = 0.15 } = opts;
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	if (reduced) {
		node.style.opacity = '1';
		return { destroy() {} };
	}
	node.style.opacity = '0';
	node.style.willChange = 'opacity, transform';
	node.style.transform = `translateY(${y}px)`;
	const observer = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					const a = animate(
						node,
						{ opacity: [0, 1], y: [y, 0] },
						{ duration, delay, ease: spring }
					);
					const clear = () => {
						node.style.willChange = '';
					};
					const finished = (a as any).finished || a;
					if (finished && typeof (finished as any).then === 'function') {
						(finished as any).then(clear).catch(clear);
					}
					observer.disconnect();
				}
			}
		},
		{ threshold, rootMargin: '0px 0px -10% 0px' }
	);
	observer.observe(node);
	return { destroy() { observer.disconnect(); } };
}

/** Reveal children on scroll, staggered */
export function inViewStagger(node: HTMLElement, opts: InViewStaggerOpts = {}) {
	const { delay = 0, duration = 0.5, y = 18, stagger = 0.08, threshold = 0.15 } = opts;
	const children = Array.from(node.children) as HTMLElement[];
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	if (reduced) {
		for (const c of children) c.style.opacity = '1';
		return { destroy() {} };
	}
	for (const c of children) {
		c.style.opacity = '0';
		c.style.willChange = 'opacity, transform';
		c.style.transform = `translateY(${y}px)`;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					children.forEach((c, i) => {
						const a = animate(
							c,
							{ opacity: [0, 1], y: [y, 0] },
							{ duration, delay: delay + i * stagger, ease: spring }
						);
						const clear = () => {
							c.style.willChange = '';
						};
						const finished = (a as any).finished || a;
						if (finished && typeof (finished as any).then === 'function') {
							(finished as any).then(clear).catch(clear);
						}
					});
					observer.disconnect();
				}
			}
		},
		{ threshold, rootMargin: '0px 0px -8% 0px' }
	);
	observer.observe(node);
	return { destroy() { observer.disconnect(); } };
}

/** Continuous gentle floating loop */
export function floatLoop(node: HTMLElement, opts: FloatOpts = {}) {
	const { duration = 4, y = 8, delay = 0 } = opts;
	animate(
		node,
		{ y: [0, -y, 0] },
		{ duration, delay, ease: 'easeInOut', repeat: Infinity }
	);
}

/** Animate a number from 0 → target (animated counter) */
export function animateNumber(
	setter: (v: number) => void,
	target: number,
	opts: NumberAnimOpts = {}
) {
	const { duration = 0.8, delay = 0 } = opts;
	// Use a plain requestAnimationFrame-based counter
	const start = performance.now() + delay * 1000;

	function tick(now: number) {
		if (now < start) {
			requestAnimationFrame(tick);
			return;
		}
		const t = Math.min((now - start) / (duration * 1000), 1);
		// ease-out cubic
		const eased = 1 - Math.pow(1 - t, 3);
		setter(Math.round(eased * target));
		if (t < 1) requestAnimationFrame(tick);
	}
	requestAnimationFrame(tick);
}
