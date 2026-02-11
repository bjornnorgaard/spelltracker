<script lang="ts">
    import {TestTube} from "@lucide/svelte";

    const {data} = $props();
</script>

<div class="container mx-auto space-y-8">
    <div class="space-y-4">
        <div class="flex items-center gap-4">
            <TestTube size={48} class="text-warning-500"/>
            <div>
                <h1 class="text-4xl font-bold">Debug Components</h1>
                <p class="text-lg opacity-70">Test and style components in isolation</p>
            </div>
        </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
        {#each data.childRoutes as page (page.href)}
            <a href={page.href} class="card preset-filled-surface-100-900 p-6 space-y-3 hover:preset-filled-primary-500 transition-all">
                <div class="flex items-center gap-3">
                    <h2 class="text-2xl font-bold">{page.label}</h2>
                </div>
                <p class="opacity-70">{page.href}</p>
            </a>
        {/each}
    </div>
</div>
