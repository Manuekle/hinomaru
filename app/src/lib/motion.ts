/**
 * Svelte actions & helpers built on top of `motion/mini` (DOM-only, no React).
 * Usage: <div use:fadeUp> or <div use:staggerChildren>
 */
import { animate } from 'motion/mini';

type FadeUpOpts = { delay?: number; duration?: number; y?: number };
type FadeInOpts = { delay?: number; duration?: number };
type ScaleInOpts = { delay?: number; duration?: number; scale?: number };
type StaggerOpts = { delay?: number; stagger?: number; y?: number; duration?: number };
type NumberAnimOpts = { duration?: number; delay?: number };

const spring: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fade + slide up on mount */
export function fadeUp(node: HTMLElement, opts: FadeUpOpts = {}) {
	const { delay = 0, duration = 0.45, y = 18 } = opts;
	animate(node, { opacity: [0, 1], y: [y, 0] }, { duration, delay, ease: spring });
}

/** Simple fade in */
export function fadeIn(node: HTMLElement, opts: FadeInOpts = {}) {
	const { delay = 0, duration = 0.35 } = opts;
	animate(node, { opacity: [0, 1] }, { duration, delay, ease: 'easeOut' });
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
	const { delay = 0, stagger = 0.07, y = 14, duration = 0.4 } = opts;
	const children = Array.from(node.children) as HTMLElement[];
	children.forEach((child, i) => {
		animate(
			child,
			{ opacity: [0, 1], y: [y, 0] },
			{ duration, delay: delay + i * stagger, ease: spring }
		);
	});
}

/** Pop / scale-bounce in */
export function popIn(node: HTMLElement, opts: ScaleInOpts = {}) {
	const { delay = 0, duration = 0.5 } = opts;
	animate(node, { opacity: [0, 1], scale: [0.7, 1.06, 1] }, { duration, delay, ease: spring });
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
