<script lang="ts">
	export let teamName: string;
	export let teamLogo: string;
</script>

<div class="mb-6 flex items-center gap-4 rounded-lg bg-gradient-to-r from-primary/20 to-transparent p-4 shadow-sm">
	<img src={teamLogo} alt="Team Logo" class="h-16 w-16 rounded-full ring-2 ring-primary/30" />
	<h2 class="text-2xl font-bold">{teamName}</h2>
</div>
