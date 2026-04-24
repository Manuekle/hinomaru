<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
	let loading = $state(false);
</script>

<div style="max-width:600px; margin:0 auto; padding:80px 24px; min-height:100vh; text-align:center;">
	<h1 use:fadeUp style="font-size:40px; font-weight:800; margin-bottom:24px; letter-spacing:-0.02em;">Get in Touch</h1>
	<p use:fadeUp={{ delay: 0.1 }} style="color:var(--fg-secondary); font-size:18px; line-height:1.6; margin-bottom:48px;">
		Have questions or feedback about Hinomaru? We'd love to hear from you.
	</p>
	
	<div use:fadeUp={{ delay: 0.2 }} style="background:var(--bg-surface); border:1px solid var(--ink-200); border-radius:32px; padding:40px; box-shadow:var(--shadow-sm); text-align:left;">
		{#if form?.success}
			<div style="text-align:center; padding:20px 0;">
				<div style="font-size:48px; margin-bottom:20px;">✅</div>
				<h2 style="font-size:24px; font-weight:700; margin-bottom:12px;">Message Sent!</h2>
				<p style="color:var(--fg-secondary); line-height:1.5;">
					Thank you for reaching out. We'll get back to you as soon as possible.
				</p>
				<button 
					onclick={() => location.reload()} 
					style="margin-top:32px; background:var(--ink-100); color:var(--sumi); border:none; padding:12px 24px; border-radius:12px; font-weight:600; cursor:pointer;"
				>
					Send another message
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
					<div style="background:rgba(188,0,45,0.1); color:var(--hinomaru-red); padding:12px 16px; border-radius:12px; font-size:14px; margin-bottom:20px; font-weight:500; border:1px solid rgba(188,0,45,0.2);">
						{form.error}
					</div>
				{/if}

				<div style="margin-bottom:20px;">
					<label for="name" class="label-meta" style="display:block; margin-bottom:8px;">Name</label>
					<input 
						type="text" 
						id="name" 
						name="name" 
						required 
						placeholder="Your name" 
						style="width:100%; height:48px; padding:0 16px; border-radius:12px; border:1px solid var(--ink-200); background:var(--paper); font-family:inherit;" 
					/>
				</div>
				
				<div style="margin-bottom:20px;">
					<label for="email" class="label-meta" style="display:block; margin-bottom:8px;">Email</label>
					<input 
						type="email" 
						id="email" 
						name="email" 
						required 
						placeholder="hello@example.com" 
						style="width:100%; height:48px; padding:0 16px; border-radius:12px; border:1px solid var(--ink-200); background:var(--paper); font-family:inherit;" 
					/>
				</div>
				
				<div style="margin-bottom:32px;">
					<label for="message" class="label-meta" style="display:block; margin-bottom:8px;">Message</label>
					<textarea 
						id="message" 
						name="message" 
						required 
						rows="4" 
						placeholder="How can we help?" 
						style="width:100%; padding:16px; border-radius:12px; border:1px solid var(--ink-200); background:var(--paper); font-family:inherit; resize:vertical;"
					></textarea>
				</div>
				
				<button 
					type="submit" 
					disabled={loading}
					class="hm-btn hm-btn-primary hm-btn-full" 
					style="height:56px; font-size:16px; opacity:{loading ? 0.7 : 1};"
				>
					{loading ? 'Sending...' : 'Send Message'}
				</button>
			</form>
		{/if}
	</div>
	
	<div style="margin-top:60px;">
		<a href="/" style="color:var(--hinomaru-red); font-weight:600; text-decoration:none;">← Back to Home</a>
	</div>
</div>
