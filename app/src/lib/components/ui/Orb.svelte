<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';

	export type AgentState = null | 'thinking' | 'listening' | 'talking';

	interface Props {
		colors?: [string, string];
		agentState?: AgentState;
		className?: string;
		seed?: number;
	}

	let {
		colors = ['#CADCFC', '#A0B9D1'],
		agentState = null,
		className = 'relative h-full w-full',
		seed = 1000
	}: Props = $props();

	let container: HTMLDivElement;
	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let camera: THREE.OrthographicCamera;
	let material: THREE.ShaderMaterial;
	let animationFrame: number;

	// Perlin Noise Texture URL from ElevenLabs
	const NOISE_TEXTURE_URL = 'https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png';

	const vertexShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	const fragmentShader = `
		uniform float uTime;
		uniform float uAnimation;
		uniform float uInverted;
		uniform float uOffsets[7];
		uniform vec3 uColor1;
		uniform vec3 uColor2;
		uniform float uInputVolume;
		uniform float uOutputVolume;
		uniform float uOpacity;
		uniform sampler2D uPerlinTexture;
		varying vec2 vUv;

		const float PI = 3.14159265358979323846;

		bool drawOval(vec2 polarUv, vec2 polarCenter, float a, float b, bool reverseGradient, float softness, out vec4 color) {
			vec2 p = polarUv - polarCenter;
			float oval = (p.x * p.x) / (a * a) + (p.y * p.y) / (b * b);
			float edge = smoothstep(1.0, 1.0 - softness, oval);
			if (edge > 0.0) {
				float gradient = reverseGradient ? (1.0 - (p.x / a + 1.0) / 2.0) : ((p.x / a + 1.0) / 2.0);
				gradient = mix(0.5, gradient, 0.1);
				color = vec4(vec3(gradient), 0.85 * edge);
				return true;
			}
			return false;
		}

		vec3 colorRamp(float grayscale, vec3 color1, vec3 color2, vec3 color3, vec3 color4) {
			if (grayscale < 0.33) return mix(color1, color2, grayscale * 3.0);
			else if (grayscale < 0.66) return mix(color2, color3, (grayscale - 0.33) * 3.0);
			else return mix(color3, color4, (grayscale - 0.66) * 3.0);
		}

		vec2 hash2(vec2 p) {
			return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
		}

		float noise2D(vec2 p) {
			vec2 i = floor(p);
			vec2 f = fract(p);
			vec2 u = f * f * (3.0 - 2.0 * f);
			float n = mix(
				mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
					dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
				mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
					dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
				u.y
			);
			return 0.5 + 0.5 * n;
		}

		float sharpRing(vec3 decomposed, float time) {
			float ringStart = 1.0;
			float ringWidth = 0.3;
			float noiseScale = 5.0;
			float noise = mix(noise2D(vec2(decomposed.x, time) * noiseScale), noise2D(vec2(decomposed.y, time) * noiseScale), decomposed.z);
			noise = (noise - 0.5) * 2.5;
			return ringStart + noise * ringWidth * 1.5;
		}

		float smoothRing(vec3 decomposed, float time) {
			float ringStart = 0.9;
			float ringWidth = 0.2;
			float noiseScale = 6.0;
			float noise = mix(noise2D(vec2(decomposed.x, time) * noiseScale), noise2D(vec2(decomposed.y, time) * noiseScale), decomposed.z);
			noise = (noise - 0.5) * 5.0;
			return ringStart + noise * ringWidth;
		}

		float flow(vec3 decomposed, float time) {
			return mix(texture2D(uPerlinTexture, vec2(time, decomposed.x / 2.0)).r, texture2D(uPerlinTexture, vec2(time, decomposed.y / 2.0)).r, decomposed.z);
		}

		void main() {
			vec2 uv = vUv * 2.0 - 1.0;
			float radius = length(uv);
			float theta = atan(uv.y, uv.x);
			if (theta < 0.0) theta += 2.0 * PI;
			vec3 decomposed = vec3(theta / (2.0 * PI), mod(theta / (2.0 * PI) + 0.5, 1.0) + 1.0, abs(theta / PI - 1.0));
			float n = flow(decomposed, radius * 0.03 - uAnimation * 0.2) - 0.5;
			theta += n * mix(0.08, 0.25, uOutputVolume);
			vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
			float originalCenters[7];
			originalCenters[0] = 0.0; originalCenters[1] = 0.5 * PI; originalCenters[2] = 1.0 * PI;
			originalCenters[3] = 1.5 * PI; originalCenters[4] = 2.0 * PI; originalCenters[5] = 2.5 * PI; originalCenters[6] = 3.0 * PI;
			float centers[7];
			for (int i = 0; i < 7; i++) {
				centers[i] = originalCenters[i] + 0.5 * sin(uTime / 20.0 + uOffsets[i]);
			}
			float a_val, b_val;
			vec4 ovalColor;
			for (int i = 0; i < 7; i++) {
				float noise_val = texture2D(uPerlinTexture, vec2(mod(centers[i] + uTime * 0.05, 1.0), 0.5)).r;
				a_val = 0.5 + noise_val * 0.3;
				b_val = noise_val * mix(3.5, 2.5, uInputVolume);
				bool reverseGradient = (mod(float(i), 2.0) == 1.0);
				float distTheta = min(abs(theta - centers[i]), min(abs(theta + 2.0 * PI - centers[i]), abs(theta - 2.0 * PI - centers[i])));
				if (drawOval(vec2(distTheta, radius), vec2(0.0, 0.0), a_val, b_val, reverseGradient, 0.6, ovalColor)) {
					color.rgb = mix(color.rgb, ovalColor.rgb, ovalColor.a);
					color.a = max(color.a, ovalColor.a);
				}
			}
			float ringRadius1 = sharpRing(decomposed, uTime * 0.1);
			float ringRadius2 = smoothRing(decomposed, uTime * 0.1);
			float inputRadius1 = radius + uInputVolume * 0.2;
			float inputRadius2 = radius + uInputVolume * 0.15;
			float opacity1 = mix(0.2, 0.6, uInputVolume);
			float opacity2 = mix(0.15, 0.45, uInputVolume);
			float ringAlpha1 = (inputRadius2 >= ringRadius1) ? opacity1 : 0.0;
			float ringAlpha2 = smoothstep(ringRadius2 - 0.05, ringRadius2 + 0.05, inputRadius1) * opacity2;
			float totalRingAlpha = max(ringAlpha1, ringAlpha2);
			vec3 ringColor = vec3(1.0);
			color.rgb = 1.0 - (1.0 - color.rgb) * (1.0 - ringColor * totalRingAlpha);
			vec3 c1 = vec3(0.0); vec3 c2 = uColor1; vec3 c3 = uColor2; vec3 c4 = vec3(1.0);
			float luminance = mix(color.r, 1.0 - color.r, uInverted);
			color.rgb = colorRamp(luminance, c1, c2, c3, c4);
			color.a *= uOpacity;
			gl_FragColor = color;
		}
	`;

	function splitmix32(a: number) {
		return function () {
			a |= 0;
			a = (a + 0x9e3779b9) | 0;
			let t = a ^ (a >>> 16);
			t = Math.imul(t, 0x21f0aaad);
			t = t ^ (t >>> 15);
			t = Math.imul(t, 0x735a2d97);
			return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
		};
	}

	const random = splitmix32(seed);
	const offsets = new Float32Array(Array.from({ length: 7 }, () => random() * Math.PI * 2));

	let curIn = 0;
	let curOut = 0.3;
	let animSpeed = 0.1;
	let lastTime = 0;

	onMount(() => {
		const { clientWidth: width, clientHeight: height } = container;

		scene = new THREE.Scene();
		camera = new THREE.OrthographicCamera(-3.5, 3.5, 3.5, -3.5, 0.1, 10);
		camera.position.z = 1;

		renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);

		const loader = new THREE.TextureLoader();
		const perlinTexture = loader.load(NOISE_TEXTURE_URL);
		perlinTexture.wrapS = THREE.RepeatWrapping;
		perlinTexture.wrapT = THREE.RepeatWrapping;

		const isDark = document.documentElement.classList.contains('dark');

		material = new THREE.ShaderMaterial({
			uniforms: {
				uTime: { value: 0 },
				uAnimation: { value: 0.1 },
				uInverted: { value: isDark ? 1 : 0 },
				uOffsets: { value: Array.from(offsets) },
				uColor1: { value: new THREE.Color(colors[0]) },
				uColor2: { value: new THREE.Color(colors[1]) },
				uInputVolume: { value: 0 },
				uOutputVolume: { value: 0 },
				uOpacity: { value: 0 },
				uPerlinTexture: { value: perlinTexture }
			},
			vertexShader,
			fragmentShader,
			transparent: true
		});

		const geometry = new THREE.CircleGeometry(3.5, 64);
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const observer = new MutationObserver(() => {
			const isDark = document.documentElement.classList.contains('dark');
			if (material) material.uniforms.uInverted.value = isDark ? 1 : 0;
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		const animate = (time: number) => {
			const delta = (time - lastTime) / 1000;
			lastTime = time;

			if (material) {
				const u = material.uniforms;
				u.uTime.value += delta * 0.5;

				if (u.uOpacity.value < 1) {
					u.uOpacity.value = Math.min(1, u.uOpacity.value + delta * 2);
				}

				let targetIn = 0;
				let targetOut = 0.3;

				const t = u.uTime.value * 2;
				if (agentState === 'listening') {
					targetIn = Math.min(1, Math.max(0, 0.55 + Math.sin(t * 3.2) * 0.35));
					targetOut = 0.45;
				} else if (agentState === 'talking') {
					targetIn = Math.min(1, Math.max(0, 0.65 + Math.sin(t * 4.8) * 0.22));
					targetOut = Math.min(1, Math.max(0, 0.75 + Math.sin(t * 3.6) * 0.22));
				} else if (agentState === 'thinking') {
					const base = 0.38 + 0.07 * Math.sin(t * 0.7);
					const wander = 0.05 * Math.sin(t * 2.1) * Math.sin(t * 0.37 + 1.2);
					targetIn = Math.min(1, Math.max(0, base + wander));
					targetOut = Math.min(1, Math.max(0, 0.48 + 0.12 * Math.sin(t * 1.05 + 0.6)));
				} else {
					targetIn = 0;
					targetOut = 0.3;
				}

				curIn += (targetIn - curIn) * 0.2;
				curOut += (targetOut - curOut) * 0.2;

				const targetSpeed = 0.1 + (1 - Math.pow(curOut - 1, 2)) * 0.9;
				animSpeed += (targetSpeed - animSpeed) * 0.12;

				u.uAnimation.value += delta * animSpeed;
				u.uInputVolume.value = curIn;
				u.uOutputVolume.value = curOut;
				u.uColor1.value.lerp(new THREE.Color(colors[0]), 0.08);
				u.uColor2.value.lerp(new THREE.Color(colors[1]), 0.08);
			}

			renderer.render(scene, camera);
			animationFrame = requestAnimationFrame(animate);
		};

		animationFrame = requestAnimationFrame(animate);

		return () => {
			observer.disconnect();
			cancelAnimationFrame(animationFrame);
			renderer.dispose();
		};
	});

	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
	});

	const handleResize = () => {
		if (!container || !renderer) return;
		const { clientWidth: width, clientHeight: height } = container;
		renderer.setSize(width, height);
	};
</script>

<svelte:window onresize={handleResize} />

<div bind:this={container} class={className}></div>
