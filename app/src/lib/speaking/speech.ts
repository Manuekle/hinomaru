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

	get active() { return this._active; }

	async start(onResult: ResultCallback, onError: ErrorCallback, onEnd: EndCallback) {
		const status = getSpeechStatus();
		if (!status.ok) {
			const msg =
				status.reason === 'insecure'
					? 'Reconocimiento de voz requiere HTTPS o localhost.'
					: status.reason === 'unsupported'
					? 'Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.'
					: 'Reconocimiento de voz no disponible.';
			onError(msg);
			return;
		}

		// Preflight mic permission — surfaces denials immediately
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			// We don't keep the stream — Speech API opens its own. Release tracks.
			stream.getTracks().forEach((t) => t.stop());
		} catch (err) {
			console.warn('[speech] mic permission failed', err);
			onError('Permiso de micrófono denegado o micrófono no disponible.');
			return;
		}

		if (this._active) this.stop();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

		this.rec = new SR();
		this.rec.lang = 'ja-JP';
		this.rec.interimResults = true;
		this.rec.maxAlternatives = 3;
		this.rec.continuous = false;

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
			const msg: Record<string, string> = {
				'no-speech':      'No se detectó voz. Habla más cerca del micrófono.',
				'audio-capture':  'No se encontró micrófono.',
				'not-allowed':    'Permiso de micrófono denegado.',
				'network':        'Error de red en el reconocimiento.',
				'aborted':        'Reconocimiento cancelado.',
				'language-not-supported': 'Idioma japonés no soportado por este navegador.'
			};
			onError(msg[e.error] ?? `Error: ${e.error}`);
		};

		this.rec.onend = () => {
			this._active = false;
			onEnd();
		};

		try {
			this.rec.start();
			this._active = true;
		} catch (err) {
			this._active = false;
			console.warn('[speech] start() threw', err);
			const msg = err instanceof Error ? err.message : 'No se pudo iniciar reconocimiento';
			onError(msg);
		}
	}

	stop() {
		if (this.rec && this._active) {
			this.rec.stop();
			this._active = false;
		}
	}
}
