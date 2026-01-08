<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/Components/navbar/navbar.svelte';
	import { PlayersStore } from '$lib/Stores/PlayerStore';
	import { UsersStore } from '$lib/Stores/UserStores';
	import { RostersStore } from '$lib/Stores/RosterStore';
	import { TransactionsStore } from '$lib/Stores/TransactionStore';
	import type { LayoutData } from './$types';

	const { children, data } = $props<{ children: any; data: LayoutData }>();

	$effect(() => {
		PlayersStore.set(data.players ?? {});
		UsersStore.set(data.users ?? []);
		RostersStore.set(data.rosters ?? []);
		TransactionsStore.set(data.transactions ?? []);
	});
</script>

<Navbar />
{@render children()}
