<script lang="ts">
	export let teamName: string;
	export let teamLogo: string;
</script>

<div class="mb-4 flex items-center">
	<img src={teamLogo} alt="Team Logo" class="mr-4 h-12 w-12 rounded-full" />
	<h2 class="text-xl font-bold">{teamName}</h2>
</div>
