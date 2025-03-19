<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { LoadPlayers } from '$lib/Stores/PlayerStores';
	let { children } = $props();

	onMount(async () => {
		await LoadPlayers(); // Load players on app initialization
	});
</script>

{@render children()}
