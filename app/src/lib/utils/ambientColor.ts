import { FastAverageColor } from 'fast-average-color';

export interface AmbientTriple {
	primary: string;
	secondary: string;
	accent: string;
}

export interface AmbientPalette {
	light: AmbientTriple;
	dark: AmbientTriple;
}

const cache = new Map<string, AmbientPalette>();
const fac = new FastAverageColor();

function thumbUrl(youtubeId: string, quality: 'maxres' | 'hq' = 'maxres'): string {
	const q = quality === 'maxres' ? 'maxresdefault' : 'hqdefault';
	return `https://i.ytimg.com/vi/${youtubeId}/${q}.jpg`;
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.referrerPolicy = 'no-referrer';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('image load failed: ' + url));
		img.src = url;
	});
}

async function sampleRegion(
	img: HTMLImageElement,
	left: number,
	top: number,
	width: number,
	height: number
): Promise<string> {
	const res = await fac.getColorAsync(img, {
		left: Math.round(img.naturalWidth * left),
		top: Math.round(img.naturalHeight * top),
		width: Math.round(img.naturalWidth * width),
		height: Math.round(img.naturalHeight * height),
		mode: 'speed',
		algorithm: 'dominant'
	});
	return res.hex;
}

// ── HSL conversion ───────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
	return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
	const to = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
	return '#' + to(r) + to(g) + to(b);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
	const rn = r / 255, gn = g / 255, bn = b / 255;
	const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l * 100];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h: number;
	switch (max) {
		case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
		case gn: h = ((bn - rn) / d + 2); break;
		default: h = ((rn - gn) / d + 4);
	}
	return [h * 60, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	const sn = s / 100, ln = l / 100;
	const c = (1 - Math.abs(2 * ln - 1)) * sn;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = ln - c / 2;
	let r = 0, g = 0, b = 0;
	if (h < 60) { r = c; g = x; }
	else if (h < 120) { r = x; g = c; }
	else if (h < 180) { g = c; b = x; }
	else if (h < 240) { g = x; b = c; }
	else if (h < 300) { r = x; b = c; }
	else { r = c; b = x; }
	return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// ── Clamp rules per mode (see plan) ──────────────────────────────────
const RULES = {
	light: { sMin: 30, sMax: 50, lMin: 72, lMax: 86 },
	dark: { sMin: 30, sMax: 65, lMin: 32, lMax: 52 }
};

// Hinomaru red is hue ~350°. Rotate out of [340, 20] (wrap-aware) to ~25°.
function rotateAwayFromBrand(h: number): number {
	const inBrand = h >= 340 || h <= 20;
	if (!inBrand) return h;
	return 25;
}

function clampOne(hex: string, mode: 'light' | 'dark'): string {
	const [r, g, b] = hexToRgb(hex);
	let [h, s, l] = rgbToHsl(r, g, b);
	const rule = RULES[mode];
	h = rotateAwayFromBrand(h);
	s = Math.max(rule.sMin, Math.min(rule.sMax, s));
	l = Math.max(rule.lMin, Math.min(rule.lMax, l));
	const [rr, gg, bb] = hslToRgb(h, s, l);
	return rgbToHex(rr, gg, bb);
}

function clampTriple(raw: AmbientTriple, mode: 'light' | 'dark'): AmbientTriple {
	return {
		primary: clampOne(raw.primary, mode),
		secondary: clampOne(raw.secondary, mode),
		accent: clampOne(raw.accent, mode)
	};
}

export async function extractPalette(youtubeId: string): Promise<AmbientPalette | null> {
	if (!youtubeId) return null;
	const cached = cache.get(youtubeId);
	if (cached) return cached;

	let img: HTMLImageElement;
	try {
		img = await loadImage(thumbUrl(youtubeId, 'maxres'));
	} catch {
		try {
			img = await loadImage(thumbUrl(youtubeId, 'hq'));
		} catch {
			return null;
		}
	}

	try {
		const [primary, secondary, accent] = await Promise.all([
			sampleRegion(img, 0, 0, 0.5, 0.5),
			sampleRegion(img, 0.5, 0, 0.5, 0.5),
			sampleRegion(img, 0.25, 0.5, 0.5, 0.5)
		]);
		const raw: AmbientTriple = { primary, secondary, accent };
		const palette: AmbientPalette = {
			light: clampTriple(raw, 'light'),
			dark: clampTriple(raw, 'dark')
		};
		cache.set(youtubeId, palette);
		return palette;
	} catch {
		return null;
	}
}
