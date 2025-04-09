<script lang="ts">
	export let teamName: string;
	export let teamLogo: string;
</script>

<div class="flex items-center gap-2">
	<img src={teamLogo} alt={teamName} class="h-6 w-6 rounded-full md:h-8 md:w-8" />
	<span class="text-xs font-bold md:text-sm xl:text-[.9rem]">{teamName}</span>
</div>
