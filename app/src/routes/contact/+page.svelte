<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import SupportKofi from '$lib/components/SupportKofi.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
	let loading = $state(false);
</script>

<div
	style="max-width:600px; margin:0 auto; padding:80px 24px; min-height:100vh; text-align:center;"
>
	<h1
		use:fadeUp
		style="font-size:40px; font-weight:800; margin-bottom:24px; letter-spacing:-0.02em;"
	>
		{t('contact.title', $locale)}
	</h1>
	<p
		use:fadeUp={{ delay: 0.1 }}
		style="color:var(--fg-secondary); font-size:18px; line-height:1.6; margin-bottom:48px;"
	>
		{t('contact.desc', $locale)}
	</p>

	<div
		use:fadeUp={{ delay: 0.2 }}
		style="background:var(--bg-surface); border:1px solid var(--ink-200); border-radius:32px; padding:40px; box-shadow:var(--shadow-sm); text-align:left;"
	>
		{#if form && form.success}
			<div style="text-align:center; padding:20px 0;">
				<div style="font-size:48px; margin-bottom:20px;">✅</div>
				<h2 style="font-size:24px; font-weight:700; margin-bottom:12px;">
					{t('contact.success.title', $locale)}
				</h2>
				<p style="color:var(--fg-secondary); line-height:1.5;">
					{t('contact.success.desc', $locale)}
				</p>
				<button
					onclick={() => location.reload()}
					style="margin-top:32px; background:var(--ink-100); color:var(--sumi); border:none; padding:12px 24px; border-radius:12px; font-weight:600; cursor:pointer;"
				>
					{t('contact.success.another', $locale)}
				</button>
			</div>
		{:else}
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				{#if form?.error}
					<div
						style="background:rgba(188,0,45,0.1); color:var(--hinomaru-red); padding:12px 16px; border-radius:12px; font-size:14px; margin-bottom:20px; font-weight:500; border:1px solid rgba(188,0,45,0.2);"
					>
						{t(form.error, $locale)}
					</div>
				{/if}

				<div style="margin-bottom:20px;">
					<label for="name" class="label-meta" style="display:block; margin-bottom:8px;"
						>{t('contact.name', $locale)}</label
					>
					<input
						type="text"
						id="name"
						name="name"
						required
						placeholder={t('contact.placeholder.name', $locale)}
						style="width:100%; height:48px; padding:0 16px; border-radius:12px; border:1px solid var(--ink-200); background:var(--paper); font-family:inherit;"
					/>
				</div>

				<div style="margin-bottom:20px;">
					<label for="email" class="label-meta" style="display:block; margin-bottom:8px;"
						>{t('contact.email', $locale)}</label
					>
					<input
						type="email"
						id="email"
						name="email"
						required
						placeholder={t('contact.placeholder.email', $locale)}
						style="width:100%; height:48px; padding:0 16px; border-radius:12px; border:1px solid var(--ink-200); background:var(--paper); font-family:inherit;"
					/>
				</div>

				<div style="margin-bottom:32px;">
					<label for="message" class="label-meta" style="display:block; margin-bottom:8px;"
						>{t('contact.message', $locale)}</label
					>
					<textarea
						id="message"
						name="message"
						required
						rows="4"
						placeholder={t('contact.placeholder.message', $locale)}
						style="width:100%; padding:16px; border-radius:12px; border:1px solid var(--ink-200); background:var(--paper); font-family:inherit; resize:vertical;"
					></textarea>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="hm-btn hm-btn-primary hm-btn-full"
					style="height:56px; font-size:16px;"
				>
					{#if loading}<DotLoader color="white" />{:else}{t('contact.send', $locale)}{/if}
				</button>
			</form>
		{/if}
	</div>

	<SupportKofi variant="card" />

	<div style="margin-top:60px;">
		<a href="/" style="color:var(--hinomaru-red); font-weight:600; text-decoration:none;"
			>← {t('deck.back', $locale)}</a
		>
	</div>
</div>
