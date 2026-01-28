<script lang="ts">
	export let championName: string = '';
	export let championAvatar: string = '';
	export let season: string = '';
	export let animationDelay: number = 0;

	let avatarError = false;

	function handleAvatarError() {
		avatarError = true;
	}

	function getInitials(name: string): string {
		if (!name) return '?';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}
</script>

{#if championName}
	<div
		class="card bg-base-200 shadow-lg fade-in border-2 border-yellow-500/30"
		style="animation-delay: {animationDelay}ms"
	>
		<div class="card-body p-6 text-center">
			<!-- Season label -->
			<div class="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-3">
				{season ? `${season} Champion` : 'League Champion'}
			</div>

			<!-- Crown icon -->
			<div class="text-2xl mb-2">👑</div>

			<!-- Champion avatar with golden ring -->
			<div class="mx-auto mb-4">
				<div class="w-20 h-20 rounded-full overflow-hidden ring-4 ring-yellow-500/50 ring-offset-4 ring-offset-base-200 champion-glow">
					{#if championAvatar && !avatarError}
						<img
							src={championAvatar}
							alt={championName}
							class="w-full h-full object-cover"
							on:error={handleAvatarError}
						/>
					{:else}
						<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-800 font-bold text-xl">
							{getInitials(championName)}
						</div>
					{/if}
				</div>
			</div>

			<!-- Champion name -->
			<h3 class="font-bold text-xl mb-3 text-base-content">
				{championName}
			</h3>

			<!-- Trophy -->
			<div class="text-5xl trophy-glow">
				🏆
			</div>
		</div>
	</div>
{:else}
	<!-- Fallback when no champion -->
	<div
		class="card bg-base-200 shadow-lg fade-in"
		style="animation-delay: {animationDelay}ms"
	>
		<div class="card-body p-6">
			<a
				href="https://imgflip.com/i/9qrtql"
				title="Real Griddy meme on imgflip"
				aria-label="Open Real Griddy meme on imgflip"
				class="block"
			>
				<img src="https://i.imgflip.com/9qrtql.jpg" alt="Real Griddy meme" class="rounded-lg" />
			</a>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.fade-in {
		animation: fade-in 0.4s ease-out forwards;
		opacity: 0;
	}

	.champion-glow {
		box-shadow: 0 0 20px rgba(250, 204, 21, 0.3);
	}

	.trophy-glow {
		filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.5));
	}
</style>
