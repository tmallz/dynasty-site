<script lang="ts">
	export let href: string;
	export let icon: string = ''; // Optional icon class
	export let text: string;
</script>

<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	class="flex items-center space-x-2 rounded-lg p-2 transition hover:bg-gray-700"
>
	{#if icon}
		<i class={icon}></i>
	{/if}
	<span class="">{text}</span>
</a>
