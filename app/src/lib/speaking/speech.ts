export interface RecognitionResult {
	transcript: string;
	confidence: number;
	isFinal: boolean;
}

export type ResultCallback = (r: RecognitionResult) => void;
export type ErrorCallback  = (err: string) => void;
export type EndCallback    = () => void;

// Checks at call time (SSR-safe)
export function isSpeechSupported(): boolean {
	if (typeof window === 'undefined') return false;
	return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

export class JapaneseSpeechRecognizer {
	private rec: AnySpeechRecognition = null;
	private _active = false;

	get active() { return this._active; }

	start(onResult: ResultCallback, onError: ErrorCallback, onEnd: EndCallback) {
		if (!isSpeechSupported()) {
			onError('Web Speech API no disponible. Usa Chrome o Edge.');
			return;
		}
		if (this._active) this.stop();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

		this.rec = new SR();
		this.rec.lang = 'ja-JP';
		this.rec.interimResults = true;   // show partial results live
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
			this._active = false;
			const msg: Record<string, string> = {
				'no-speech':      'No se detectó voz. Habla más cerca del micrófono.',
				'audio-capture':  'No se encontró micrófono.',
				'not-allowed':    'Permiso de micrófono denegado.',
				'network':        'Error de red en el reconocimiento.',
				'aborted':        'Reconocimiento cancelado.'
			};
			onError(msg[e.error] ?? `Error: ${e.error}`);
		};

		this.rec.onend = () => {
			this._active = false;
			onEnd();
		};

		this.rec.start();
		this._active = true;
	}

	stop() {
		if (this.rec && this._active) {
			this.rec.stop();
			this._active = false;
		}
	}
}
