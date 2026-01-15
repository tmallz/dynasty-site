<script lang="ts">
	export let upOrDown: boolean; // true for up, false for down
	export let playerName: string = '';
	export let playerPosition: string = '';
	export let playerTeam: string = '';
	export let playerAvatar: string = '';
	export let teamAvatar: string = '';
	export let numWaivers: number = 0;
</script>

<div class="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
	<div class="card-body p-4">
		<div class="flex items-center gap-4">
			<!-- Player Avatar with Team Badge -->
			<div class="relative shrink-0">
				<div class="w-14 h-14 rounded-full overflow-hidden ring-2 {upOrDown ? 'ring-success' : 'ring-error'} ring-offset-2 ring-offset-base-300">
					{#if playerAvatar}
						<img src={playerAvatar} alt={playerName} class="w-full h-full object-cover" />
					{:else}
						<div class="w-full h-full flex items-center justify-center bg-base-100 text-base-content/50">
							?
						</div>
					{/if}
				</div>
				<!-- Team Logo Badge -->
				{#if teamAvatar}
					<div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full overflow-hidden bg-base-100 ring-2 ring-base-300">
						<img src={teamAvatar} alt={playerTeam} class="w-full h-full object-cover" />
					</div>
				{/if}
			</div>

			<!-- Player Info -->
			<div class="flex-1 min-w-0">
				<h3 class="font-bold text-base truncate">{playerName}</h3>
				<div class="flex items-center gap-2 mt-1">
					<span class="badge badge-sm {upOrDown ? 'badge-success' : 'badge-error'} badge-outline">
						{playerPosition}
					</span>
					<span class="text-xs text-base-content/60">{playerTeam}</span>
				</div>
			</div>

			<!-- Trending Indicator -->
			<div class="flex flex-col items-center shrink-0">
				<div class="text-2xl {upOrDown ? 'text-success' : 'text-error'}">
					{upOrDown ? '📈' : '📉'}
				</div>
				<div class="text-xs font-bold {upOrDown ? 'text-success' : 'text-error'}">
					{upOrDown ? '+' : ''}{numWaivers}
				</div>
			</div>
		</div>
	</div>
</div>
