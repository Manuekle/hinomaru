export interface RecognitionResult {
	transcript: string;
	confidence: number;
	isFinal: boolean;
}

export type ResultCallback = (r: RecognitionResult) => void;
export type ErrorCallback  = (err: string) => void;
export type EndCallback    = () => void;

export type SpeechStatus =
	| { ok: true }
	| { ok: false; reason: 'no-window' | 'insecure' | 'unsupported' };

export function getSpeechStatus(): SpeechStatus {
	if (typeof window === 'undefined') return { ok: false, reason: 'no-window' };
	if (!window.isSecureContext) return { ok: false, reason: 'insecure' };
	const has = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
	return has ? { ok: true } : { ok: false, reason: 'unsupported' };
}

export function isSpeechSupported(): boolean {
	return getSpeechStatus().ok;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

export class JapaneseSpeechRecognizer {
	private rec: AnySpeechRecognition = null;
	private _active = false;
	private _starting = false;
	private mediaStream: MediaStream | null = null;
	private currentEnd: EndCallback | null = null;

	get active() { return this._active || this._starting; }

	public async start(onResult: ResultCallback, onError: ErrorCallback, onEnd: EndCallback) {
		if (this._starting || this._active) {
			this.abort();
		}
		this._starting = true;
		this.currentEnd = onEnd;

		const status = getSpeechStatus();
		if (!status.ok) {
			this._starting = false;
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
			let permState: PermissionState = 'prompt';
			if (navigator.permissions) {
				try {
					const perm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
					permState = perm.state;
				} catch {
					/* permissions API unsupported */
				}
			}
			if (permState === 'denied') {
				this._starting = false;
				onError('Permiso de micrófono denegado.');
				onEnd();
				return;
			}
			// Acquire stream we own. Keep alive while recognition runs; some browsers
			// (iOS Safari) won't release the mic indicator unless we stop tracks ourselves.
			this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (err: any) {
			this._starting = false;
			console.warn('[speech] mic permission failed', err);
			const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
			onError(denied ? 'Permiso de micrófono denegado.' : 'Micrófono no disponible.');
			onEnd();
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

		this.rec = new SR();
		this.rec.lang = 'ja-JP';
		this.rec.interimResults = true;
		this.rec.maxAlternatives = 3;
		this.rec.continuous = false;

		this.rec.onstart = () => {
			this._starting = false;
			this._active = true;
		};

		this.rec.onresult = (e: SpeechRecognitionEvent) => {
			for (let i = e.resultIndex; i < e.results.length; i++) {
				const alt = e.results[i][0];
				onResult({
					transcript: alt.transcript,
					confidence: alt.confidence ?? 0,
					isFinal: e.results[i].isFinal
				});
			}
		};

		this.rec.onerror = (e: SpeechRecognitionErrorEvent) => {
			console.warn('[speech] onerror', e.error);
			this._active = false;
			this._starting = false;
			const msg: Record<string, string> = {
				'no-speech':      'No se detectó voz. Habla más cerca del micrófono.',
				'audio-capture':  'No se encontró micrófono.',
				'not-allowed':    'Permiso de micrófono denegado.',
				'service-not-allowed': 'Permiso de micrófono denegado.',
				'network':        'Error de red en el reconocimiento.',
				'aborted':        '',
				'language-not-supported': 'Idioma japonés no soportado por este navegador.'
			};
			const m = msg[e.error] ?? `Error: ${e.error}`;
			if (m) onError(m);
			this.releaseStream();
		};

		this.rec.onend = () => {
			this._active = false;
			this._starting = false;
			this.releaseStream();
			onEnd();
		};

		try {
			this.rec.start();
		} catch (err) {
			this._active = false;
			this._starting = false;
			this.releaseStream();
			console.warn('[speech] start() threw', err);
			const msg = err instanceof Error ? err.message : 'No se pudo iniciar reconocimiento';
			onError(msg);
			onEnd();
		}
	}

	public stop() {
		if (!this.rec) {
			this._active = false;
			this._starting = false;
			this.releaseStream();
			return;
		}
		try { this.rec.stop(); } catch { /* ignore */ }
	}

	public abort() {
		if (this.rec) {
			try {
				this.rec.onresult = null;
				this.rec.onerror = null;
				this.rec.onend = null;
				this.rec.onstart = null;
				this.rec.abort?.();
				this.rec.stop?.();
			} catch { /* ignore */ }
		}
		this.rec = null;
		this._active = false;
		this._starting = false;
		this.releaseStream();
		const cb = this.currentEnd;
		this.currentEnd = null;
		cb?.();
	}

	private releaseStream() {
		if (this.mediaStream) {
			try { this.mediaStream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
			this.mediaStream = null;
		}
	}
}
