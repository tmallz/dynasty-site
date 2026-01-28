<script lang="ts">
	interface Props {
		href: string;
		icon?: string;
		text: string;
		paywall: boolean;
	}

	let { href, icon = '', text, paywall }: Props = $props();
</script>

<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	class="flex items-center space-x-2 rounded-lg p-2 transition hover:bg-base-300"
>
	{#if icon}
		<i class={icon}></i>
	{/if}
	<span class="text-base-content">
		{text}{paywall ? '*' : ''}
	</span>
</a>
