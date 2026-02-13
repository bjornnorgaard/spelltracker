<script lang="ts">
    const {title, subtitle} = $props();
</script>

<div class="flex flex-col">
    <div class="flex gap-2 items-center">
        <div class="h-1 w-4 card preset-filled-surface-500"></div>
        <h1 class="preset-typo-title w-fit mb-0 ">{title}</h1>
        <div class="h-1 grow card preset-filled-surface-500"></div>
    </div>
    <p class="text-surface-600-400 text-sm">{subtitle}</p>
</div>
