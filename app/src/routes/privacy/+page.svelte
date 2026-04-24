<script lang="ts">
	import { fadeUp } from '$lib/motion';
</script>

<div style="max-width:800px; margin:0 auto; padding:80px 24px; min-height:100vh;">
	<h1 use:fadeUp style="font-size:40px; font-weight:800; margin-bottom:40px; letter-spacing:-0.02em;">Privacy Policy</h1>
	
	<div use:fadeUp={{ delay: 0.1 }} style="color:var(--fg-secondary); line-height:1.7; font-size:16px;">
		<p>Last updated: April 24, 2026</p>
		
		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">1. Information We Collect</h2>
		<p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our learning tools. This includes your email and study progress.</p>
		
		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">2. How We Use Your Information</h2>
		<p>We use the information we collect to provide, maintain, and improve our services, and to personalize your learning experience via the Spaced Repetition System (SRS).</p>
		
		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">3. Data Security</h2>
		<p>We use industry-standard security measures to protect your personal information. Your data is stored securely using Supabase infrastructure.</p>
		
		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">4. Cookies</h2>
		<p>We use cookies to maintain your session and remember your preferences. You can control cookie settings in your browser.</p>
		
		<h2 style="color:var(--sumi); margin-top:32px; font-size:24px;">5. Your Rights</h2>
		<p>You have the right to access, update, or delete your personal information at any time through your account settings.</p>
	</div>
	
	<div style="margin-top:60px;">
		<a href="/" style="color:var(--hinomaru-red); font-weight:600; text-decoration:none;">← Back to Home</a>
	</div>
</div>
