<script lang="ts">
	export let teamName: string;
	export let teamLogo: string;
</script>

<div class="flex items-center gap-2">
	<img src={teamLogo} alt={teamName} class="h-8 w-8 rounded-full" />
	<span class="font-bold">{teamName}</span>
</div>
