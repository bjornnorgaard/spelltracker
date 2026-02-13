<script lang="ts">
    const {title, subtitle, trailing = null} = $props();
</script>

<div class="flex mb-0 justify-between items-center">
    <h1 class="preset-typo-headline">{title}</h1>
    {#if trailing}
        {@render trailing()}
    {/if}
</div>
<p class="preset-typo-caption leading-4">{subtitle}</p>
