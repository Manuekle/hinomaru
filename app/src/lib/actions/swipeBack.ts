interface SwipeBackOptions {
	edgeThreshold?: number;
	minDistance?: number;
	minVelocity?: number;
	onBack?: () => void;
}

export function swipeBack(node: HTMLElement, options: SwipeBackOptions = {}) {
	const {
		edgeThreshold = 30,
		minDistance = 70,
		minVelocity = 0.25,
		onBack = () => history.back()
	} = options;

	let startX = 0;
	let startY = 0;
	let startTime = 0;
	let tracking = false;

	function onTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		if (touch.clientX > edgeThreshold) return;
		startX = touch.clientX;
		startY = touch.clientY;
		startTime = Date.now();
		tracking = true;
	}

	function onTouchEnd(e: TouchEvent) {
		if (!tracking) return;
		tracking = false;

		const touch = e.changedTouches[0];
		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;
		const dt = Date.now() - startTime;

		// Must be mostly horizontal
		if (Math.abs(dy) > Math.abs(dx)) return;
		if (dx < minDistance) return;
		if (dt === 0 || dx / dt < minVelocity) return;

		onBack();
	}

	function onTouchCancel() {
		tracking = false;
	}

	node.addEventListener('touchstart', onTouchStart, { passive: true });
	node.addEventListener('touchend', onTouchEnd, { passive: true });
	node.addEventListener('touchcancel', onTouchCancel, { passive: true });

	return {
		destroy() {
			node.removeEventListener('touchstart', onTouchStart);
			node.removeEventListener('touchend', onTouchEnd);
			node.removeEventListener('touchcancel', onTouchCancel);
		}
	};
}
