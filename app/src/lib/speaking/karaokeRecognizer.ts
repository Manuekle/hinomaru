import { getSpeechStatus } from './speech';

export interface KaraokeRecognitionResult {
	transcript: string;
	confidence: number;
	isFinal: boolean;
}

export type KaraokeResultCallback = (r: KaraokeRecognitionResult) => void;
export type KaraokeErrorCallback = (err: string) => void;
export type KaraokeEndCallback = () => void;

// Continuous Japanese recognizer for karaoke. Restarts automatically when the
// browser ends a session (Chrome cuts after ~60s of silence or each utterance),
// so the user can sing through a full clip without re-clicking.
export class KaraokeRecognizer {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private rec: any = null;
	private _active = false;
	private _starting = false;
	private _userStopped = false;
	private mediaStream: MediaStream | null = null;

	private onResult: KaraokeResultCallback | null = null;
	private onError: KaraokeErrorCallback | null = null;
	private onEnd: KaraokeEndCallback | null = null;

	get active(): boolean { return this._active || this._starting; }
	getMediaStream(): MediaStream | null { return this.mediaStream; }

	async start(
		onResult: KaraokeResultCallback,
		onError: KaraokeErrorCallback,
		onEnd: KaraokeEndCallback
	): Promise<void> {
		this.onResult = onResult;
		this.onError = onError;
		this.onEnd = onEnd;
		this._userStopped = false;

		const status = getSpeechStatus();
		if (!status.ok) {
			const msg =
				status.reason === 'insecure'
					? 'Reconocimiento de voz requiere HTTPS o localhost.'
					: status.reason === 'unsupported'
					? 'Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.'
					: 'Reconocimiento de voz no disponible.';
			onError(msg);
			onEnd();
			return;
		}

		try {
			this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (err) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const e = err as any;
			const denied = e?.name === 'NotAllowedError' || e?.name === 'SecurityError';
			onError(denied ? 'Permiso de micrófono denegado.' : 'Micrófono no disponible.');
			onEnd();
			return;
		}

		this.spawnSession();
	}

	private spawnSession(): void {
		if (this._userStopped) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
		if (!SR) {
			this.onError?.('Reconocimiento de voz no disponible.');
			this.cleanup();
			this.onEnd?.();
			return;
		}

		this._starting = true;
		const rec = new SR();
		rec.lang = 'ja-JP';
		rec.interimResults = true;
		rec.maxAlternatives = 1;
		rec.continuous = true;

		rec.onstart = () => {
			this._starting = false;
			this._active = true;
		};

		rec.onresult = (e: SpeechRecognitionEvent) => {
			for (let i = e.resultIndex; i < e.results.length; i++) {
				const alt = e.results[i][0];
				this.onResult?.({
					transcript: alt.transcript,
					confidence: alt.confidence ?? 0,
					isFinal: e.results[i].isFinal
				});
			}
		};

		rec.onerror = (e: SpeechRecognitionErrorEvent) => {
			// Common transient errors should not tear down the karaoke session.
			if (e.error === 'no-speech' || e.error === 'aborted') return;
			const msg: Record<string, string> = {
				'audio-capture': 'No se encontró micrófono.',
				'not-allowed': 'Permiso de micrófono denegado.',
				'service-not-allowed': 'Permiso de micrófono denegado.',
				'network': 'Error de red en el reconocimiento.',
				'language-not-supported': 'Idioma japonés no soportado por este navegador.'
			};
			const m = msg[e.error] ?? `Error: ${e.error}`;
			if (m) this.onError?.(m);
		};

		rec.onend = () => {
			this._active = false;
			this._starting = false;
			if (this._userStopped) {
				this.cleanup();
				this.onEnd?.();
			} else {
				// Auto-restart with small delay so Chrome can release the previous session.
				setTimeout(() => this.spawnSession(), 120);
			}
		};

		this.rec = rec;
		try {
			rec.start();
		} catch {
			// `start()` throws if called too fast after the previous session;
			// retry shortly.
			this._starting = false;
			setTimeout(() => this.spawnSession(), 200);
		}
	}

	stop(): void {
		this._userStopped = true;
		if (this.rec) {
			try { this.rec.stop(); } catch { /* ignore */ }
		} else {
			this.cleanup();
			this.onEnd?.();
		}
	}

	abort(): void {
		this._userStopped = true;
		if (this.rec) {
			try {
				this.rec.onresult = null;
				this.rec.onerror = null;
				this.rec.onend = null;
				this.rec.abort?.();
			} catch { /* ignore */ }
		}
		this.cleanup();
		const cb = this.onEnd;
		this.onEnd = null;
		cb?.();
	}

	private cleanup(): void {
		this.rec = null;
		this._active = false;
		this._starting = false;
		if (this.mediaStream) {
			try { this.mediaStream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
			this.mediaStream = null;
		}
	}
}
