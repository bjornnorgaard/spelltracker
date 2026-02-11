<script lang="ts">
    let {children, data} = $props();
</script>

<nav class="card p-4">
    <ul class="container mx-auto flex gap-2">
        {#each data.childRoutes as debugPage (debugPage.href)}
            <li class="list-inside list-disc">
                <a href={debugPage.href} class="anchor">{debugPage.label}</a>
            </li>
        {/each}
    </ul>
</nav>

<main>
    {@render children()}
</main>
