<script lang="ts">
	export let matchup: {
		team1Name: string;
		team2Name: string;
		team1Score: number;
		team2Score: number;
		team1Avatar?: string;
		team2Avatar?: string;
		winnerName?: string;
		round: number;
	};
	export let variant: 'winners' | 'losers' | 'consolation' = 'winners';
	export let onClick: (() => void) | undefined = undefined;
	export let animationDelay: number = 0;

	// Track failed avatar loads
	let failedAvatars = new Set<string>();

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && onClick) {
			onClick();
		}
	}

	$: highlightColor = variant === 'losers' ? 'error' : 'success';
	$: isTeam1Winner = matchup.winnerName === matchup.team1Name;
	$: isTeam2Winner = matchup.winnerName === matchup.team2Name;
</script>

<div
	class="rounded-lg bg-base-300 border-2 border-base-content/20 w-64 md:w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 fade-in {onClick ? 'cursor-pointer' : ''}"
	style="animation-delay: {animationDelay}ms"
	on:click={onClick}
	on:keydown={handleKeydown}
	role={onClick ? 'button' : undefined}
	tabindex={onClick ? 0 : undefined}
>
	<!-- Team 1 -->
	<div
		class="p-3 border-b border-base-content/10 {isTeam1Winner ? `border-l-4 border-${highlightColor} bg-${highlightColor}/5` : ''}"
	>
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 flex-1 min-w-0">
				{#if matchup.team1Avatar && !failedAvatars.has(matchup.team1Avatar)}
					<img
						src={matchup.team1Avatar}
						alt={matchup.team1Name}
						class="w-8 h-8 rounded-full"
						on:error={() => {
							if (matchup.team1Avatar) failedAvatars.add(matchup.team1Avatar);
							failedAvatars = failedAvatars;
						}}
					/>
				{:else}
					<div
						class="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-content text-xs"
					>
						{getInitials(matchup.team1Name)}
					</div>
				{/if}
				<span
					class="truncate {isTeam1Winner ? `font-bold text-${highlightColor}` : ''}"
				>
					{matchup.team1Name}
				</span>
			</div>
			<span class="font-semibold {isTeam1Winner ? `text-${highlightColor}` : ''}">
				{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
			</span>
		</div>
	</div>

	<!-- Team 2 -->
	<div
		class="p-3 {isTeam2Winner ? `border-l-4 border-${highlightColor} bg-${highlightColor}/5` : ''}"
	>
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 flex-1 min-w-0">
				{#if matchup.team2Avatar && !failedAvatars.has(matchup.team2Avatar)}
					<img
						src={matchup.team2Avatar}
						alt={matchup.team2Name}
						class="w-8 h-8 rounded-full"
						on:error={() => {
							if (matchup.team2Avatar) failedAvatars.add(matchup.team2Avatar);
							failedAvatars = failedAvatars;
						}}
					/>
				{:else if matchup.team2Name !== 'BYE' && matchup.team2Name !== 'TBD'}
					<div
						class="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-content text-xs"
					>
						{getInitials(matchup.team2Name)}
					</div>
				{/if}
				<span
					class="truncate {isTeam2Winner ? `font-bold text-${highlightColor}` : matchup.team2Name === 'BYE' ? 'text-gray-500 italic' : ''}"
				>
					{matchup.team2Name}
				</span>
			</div>
			<span class="font-semibold {isTeam2Winner ? `text-${highlightColor}` : ''}">
				{matchup.team2Name === 'BYE' || matchup.team2Name === 'TBD'
					? ''
					: matchup.team2Score.toFixed(2)}
			</span>
		</div>
	</div>
</div>

<style>
	.fade-in {
		animation: fade-in 0.4s ease-out forwards;
		opacity: 0;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Dynamic color classes for Tailwind - must be explicitly defined */
	.border-success {
		border-color: oklch(var(--su));
	}
	.bg-success\/5 {
		background-color: oklch(var(--su) / 0.05);
	}
	.text-success {
		color: oklch(var(--su));
	}
	.border-error {
		border-color: oklch(var(--er));
	}
	.bg-error\/5 {
		background-color: oklch(var(--er) / 0.05);
	}
	.text-error {
		color: oklch(var(--er));
	}
</style>
