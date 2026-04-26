<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
</script>

<div
	style="max-width:800px; margin:0 auto; padding:calc(40px + env(safe-area-inset-top)) 24px 100px; min-height:100vh;"
>
	<h1
		use:fadeUp
		style="font-size:40px; font-weight:800; margin-bottom:40px; letter-spacing:-0.02em;"
	>
		{t('terms.title', $locale)}
	</h1>

	<div
		use:fadeUp={{ delay: 0.1 }}
		style="color:var(--fg-secondary); line-height:1.7; font-size:16px;"
	>
		<p>{t('terms.updated', $locale)}</p>

		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">
			{t('terms.s1.title', $locale)}
		</h2>
		<p>{t('terms.s1.desc', $locale)}</p>

		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">
			{t('terms.s2.title', $locale)}
		</h2>
		<p>{t('terms.s2.desc', $locale)}</p>

		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">
			{t('terms.s3.title', $locale)}
		</h2>
		<p>{t('terms.s3.desc', $locale)}</p>

		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">
			{t('terms.s4.title', $locale)}
		</h2>
		<p>{t('terms.s4.desc', $locale)}</p>

		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">
			{t('terms.s5.title', $locale)}
		</h2>
		<p>{t('terms.s5.desc', $locale)}</p>
	</div>

	<div style="margin-top:60px;">
		<a href="/" style="color:var(--hinomaru-red); font-weight:600; text-decoration:none;"
			>← {t('deck.back', $locale)}</a
		>
	</div>
</div>
