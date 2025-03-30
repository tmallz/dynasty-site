<script lang="ts">
	import { onMount } from 'svelte';
	import { RostersHelper } from '$lib/Utilities/RostersHelper';
	import type { RosterPageDto } from '$lib/Utilities/Dtos/RosterPageDto';
	import TeamHeader from '$lib/Components/matchups/TeamHeader.svelte';
	import RosterSpot from '$lib/Components/matchups/RosterSpot.svelte';

	let rosters: RosterPageDto[] = [];
	let expandedBenches: Record<string, boolean> = {};
	let allBenchesExpanded = false;

	let getBadgeClass: (position: string) => string = (position: string) => {
		switch (position) {
			case 'QB':
				return 'bg-qb'; // Custom class for QB
			case 'RB':
				return 'bg-rb'; // Custom class for RB
			case 'WR':
				return 'bg-wr'; // Custom class for WR
			case 'TE':
				return 'bg-te'; // Custom class for TE
			case 'WRT':
				return 'bg-wrt'; // Shared class for FLEX (WRT)
			case 'WRTQ':
				return 'bg-wrtq'; // Shared class for SUPER-FLEX (WRTQ)
			default:
				return 'badge-neutral';
		}
	};

	function assignRoles(players: any[]) {
		console.log('Assigning roles to players:', players);
		const roleOrder = ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'FLEX', 'SUPER-FLEX']; // Desired order
		const roleCounts = { QB: 0, RB: 0, WR: 0, TE: 0, FLEX: 0, 'SUPER-FLEX': 0 }; // Current counts for each role
		const roleLimits = { QB: 1, RB: 2, WR: 3, TE: 1, FLEX: 2, 'SUPER-FLEX': 1 }; // Limits for each role

		// Sort players by depth_chart_order (ascending)
		players.sort((a, b) => (a.depth_chart_order ?? 999) - (b.depth_chart_order ?? 999));

		// Assign roles based on the desired order
		const orderedPlayers: any[] = [];

		// Assign roles in the specified order
		roleOrder.forEach((role) => {
			const player = players.find((p) => {
				if (role === 'FLEX') {
					// FLEX can be any position except QB
					return ['RB', 'WR', 'TE'].includes(p.position) && !orderedPlayers.includes(p);
				} else if (role === 'SUPER-FLEX') {
					// SUPER-FLEX can include QB, RB, WR, or TE
					return ['QB', 'RB', 'WR', 'TE'].includes(p.position) && !orderedPlayers.includes(p);
				} else {
					// Primary roles (QB, RB, WR, TE)
					return (
						p.position === role &&
						roleCounts[role as keyof typeof roleCounts] <
							roleLimits[role as keyof typeof roleLimits] &&
						!orderedPlayers.includes(p)
					);
				}
			});

			if (player) {
				// Assign display labels for FLEX and SUPER-FLEX
				player.role = role === 'FLEX' ? 'WRT' : role === 'SUPER-FLEX' ? 'WRTQ' : role;
				console.log(`Assigning ${player.full_name} to role: ${player.role}`);
				roleCounts[role as keyof typeof roleCounts]++;
				orderedPlayers.push(player);
			} else {
				console.log(`No player found for role: ${role}`);
			}
		});

		// Debugging: Check for unassigned players
		const unassignedPlayers = players.filter((p) => !orderedPlayers.includes(p));
		if (unassignedPlayers.length > 0) {
			console.warn('Unassigned Players:', unassignedPlayers);
		}

		console.log('Ordered Players:', orderedPlayers);
		return orderedPlayers;
	}

	function toggleBench(teamName: string) {
		expandedBenches[teamName] = !expandedBenches[teamName];
	}

	function toggleAllBenches() {
		allBenchesExpanded = !allBenchesExpanded;
		Object.keys(expandedBenches).forEach((teamName) => {
			expandedBenches[teamName] = allBenchesExpanded;
		});
	}

	onMount(async () => {
		rosters = await RostersHelper.GetAllRosters();
		console.log('Rosters:', rosters);

		rosters.forEach((roster) => {
			expandedBenches[roster.TeamName] = false; // Default to collapsed
		});
	});
</script>

<main class="grid grid-cols-1 gap-8 p-6 md:grid-cols-3">
	<div class="col-span-full mb-4 text-center">
		<button class="btn btn-primary" on:click={toggleAllBenches}>
			{allBenchesExpanded ? 'Collapse All Benches' : 'Expand All Benches'}
		</button>
	</div>

	{#each rosters as roster}
		<div class="bg-base-100 rounded-lg p-6 shadow-lg">
			<!-- Team Header -->
			<TeamHeader teamName={roster.TeamName} teamLogo={roster.AvatarUrl} />

			<!-- Player List -->
			<ul class="space-y-2">
				{#each assignRoles(Object.values(roster.Starters)) as player}
					<RosterSpot
						position={player.role}
						badgeClass={getBadgeClass(player.role)}
						playerName={player.first_name + ' ' + player.last_name}
						playerTeam={player.team ?? ''}
						playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
						PlayerTeamLogo={player.playerTeamAvatarUrl ?? 'https://via.placeholder.com/150'}
					/>
				{/each}
			</ul>

			<div
				class="bg-base-100 hover:background-secondary dark:hover:bg-base-300 mt-4 flex cursor-pointer items-center justify-between rounded-lg p-2"
				on:click={() => toggleBench(roster.TeamName)}
			>
				<span class="font-semibold">
					{expandedBenches[roster.TeamName] ? 'Collapse Bench' : 'Expand to See Bench'}
				</span>
				<i class={`fas ${expandedBenches[roster.TeamName] ? 'fa-chevron-up' : 'fa-chevron-down'}`}
				></i>
			</div>

			<!-- Bench Players -->
			{#if expandedBenches[roster.TeamName]}
				<ul class="mt-4 space-y-2">
					{#each Object.values(roster.Bench) as player}
						<RosterSpot
							position="BN"
							badgeClass={getBadgeClass('BN')}
							playerName={player.first_name + ' ' + player.last_name}
							playerTeam={player.team ?? ''}
							playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
							PlayerTeamLogo={player.playerTeamAvatarUrl ?? 'https://via.placeholder.com/150'}
						/>
					{/each}
				</ul>
			{/if}
		</div>
	{/each}
</main>
