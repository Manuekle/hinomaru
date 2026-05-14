// Lightweight RMS meter over a MediaStream. Used by karaoke for ducking
// the YouTube player and driving the mic orb visualization.

export type LevelCallback = (rms: number) => void;

export function startLevelMeter(
	stream: MediaStream,
	onLevel: LevelCallback,
	fps = 30
): () => void {
	if (typeof window === 'undefined') return () => {};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const Ctor: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
	if (!Ctor) return () => {};

	let ctx: AudioContext | null;
	try {
		ctx = new Ctor();
	} catch {
		return () => {};
	}

	// Some browsers start the context suspended; the caller is invoked from a
	// user gesture (the FAB click) so resume is allowed.
	ctx.resume().catch(() => {});

	const source = ctx.createMediaStreamSource(stream);
	const analyser = ctx.createAnalyser();
	analyser.fftSize = 512;
	analyser.smoothingTimeConstant = 0.6;
	source.connect(analyser);

	const buf = new Uint8Array(analyser.fftSize);
	const interval = Math.max(1000 / fps, 16);
	let stopped = false;

	const tick = () => {
		if (stopped) return;
		analyser.getByteTimeDomainData(buf);
		let sumSq = 0;
		for (let i = 0; i < buf.length; i++) {
			const v = (buf[i] - 128) / 128;
			sumSq += v * v;
		}
		const rms = Math.sqrt(sumSq / buf.length);
		onLevel(rms);
	};

	const timer = setInterval(tick, interval);

	return () => {
		if (stopped) return;
		stopped = true;
		clearInterval(timer);
		try { source.disconnect(); } catch { /* ignore */ }
		try { analyser.disconnect(); } catch { /* ignore */ }
		try { ctx?.close(); } catch { /* ignore */ }
		ctx = null;
	};
}
