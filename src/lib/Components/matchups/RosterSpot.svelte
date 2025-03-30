<script lang="ts">
	export let position: string;
	export let badgeClass: string;
	export let playerName: string;
	export let playerTeam: string;
	export let playerImage: string;
	export let PlayerTeamLogo: string;
</script>

<li class="flex items-center justify-between">
	<!-- Position Badge -->
	<span class={`badge ${badgeClass}`} style="width: 50px; text-align: center;">
		{position}
	</span>

	<!-- Player Details -->
	<div class="ml-4 flex w-full items-center space-x-2">
		<!-- Player Image -->
		<img src={playerImage} alt={playerName} class="h-10 w-10 rounded-full" />

		<!-- Team Logo -->
		<img src={PlayerTeamLogo} alt={playerTeam} class="h-6 w-6 rounded-full" />

		<!-- Player Info -->
		<div>
			<p class="font-semibold">{playerName}</p>
			<p class="text-sm text-gray-500">{playerTeam}</p>
		</div>
	</div>
</li>

<style>
	.bg-qb {
		background-color: #ff2a6d; /* QB background color */
		color: white; /* Optional: text color for contrast */
	}

	.bg-rb {
		background-color: #00ceb8; /* RB background color */
		color: white; /* Optional: text color for contrast */
	}

	.bg-wr {
		background-color: #58a7ff; /* WR background color */
		color: white; /* Optional: text color for contrast */
	}

	.bg-te {
		background-color: #ffae58; /* TE background color */
		color: white; /* Optional: text color for contrast */
	}

	.bg-wrt {
		background: linear-gradient(
			90deg,
			#58a7ff 33%,
			#00ceb8 33%,
			#00ceb8 66%,
			#ffae58 66%
		); /* FLEX (WRT) gradient */
		color: white; /* Optional: text color for contrast */
	}

	.bg-wrtq {
		background: repeating-linear-gradient(
			90deg,
			#58a7ff 0%,
			#58a7ff 25%,
			#00ceb8 25%,
			#00ceb8 50%,
			#ffae58 50%,
			#ffae58 75%,
			#ff2a6d 75%,
			#ff2a6d 100% /* Solid pink for QB */
		);
		color: white; /* Optional: text color for contrast */
	}
</style>
