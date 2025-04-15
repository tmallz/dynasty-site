<script lang="ts">
	export let mostRecentWinner: string;
</script>

<div class="mb-6">
	<h2 class="text-xl font-bold">Most Recent Winner</h2>
	{#if mostRecentWinner === ''}
		<a href="https://imgflip.com/i/9qrtql"
			><img src="https://i.imgflip.com/9qrtql.jpg" title="made at imgflip.com" /></a
		>
	{:else}
		<div><a href="https://imgflip.com/memegenerator">from Imgflip Meme Generator</a></div>
		<p class="mt-2 text-lg">{mostRecentWinner}</p>
	{/if}
</div>
