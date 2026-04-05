<script lang="ts">
    import {resolve} from "$app/paths";

    const {title, subtitle, trailing = null, titleHref = undefined, disableTitleLink = false} = $props();
</script>

<div class="flex mb-0 justify-between items-center">
    <h1 class="preset-typo-headline">
        {#if titleHref && !disableTitleLink}
            <a href={resolve(titleHref)} class="text-inherit no-underline hover:underline decoration-primary-500">{title}</a>
        {:else}
            {title}
        {/if}
    </h1>
    {#if trailing}
        {@render trailing()}
    {/if}
</div>
<p class="preset-typo-caption leading-4">{subtitle}</p>
