<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { LoadPlayers } from '$lib/Stores/PlayerStore';
	import { LoadUsers } from '$lib/Stores/UserStores';
	import { LoadRosters } from '$lib/Stores/RosterStore';
	import Navbar from '$lib/Components/navbar/navbar.svelte';
	import { LoadTransactions } from '$lib/Stores/TransactionStore';
	let { children } = $props();
	let leagueId = import.meta.env.VITE_LEAGUE_ID;

	onMount(async () => {
		await LoadPlayers(); // Load players on app initialization
		await LoadUsers(leagueId); // Load users on app initialization
		await LoadRosters(leagueId); // Load rosters on app initialization
		await LoadTransactions(); // Load transactions on app initialization
	});
</script>

<Navbar />
{@render children()}
