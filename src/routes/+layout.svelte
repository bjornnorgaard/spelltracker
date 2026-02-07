<script lang="ts">
    import "./layout.css";
    import {app} from "$lib/stores/app.svelte";

    let {children} = $props();
</script>

<main class="mx-auto p-4 min-h-screen">
    {@render children()}
</main>

<footer class="p-8 mt-16 preset-filled-primary-50-950 space-y-4">
    <div class="space-y-1">
        <p>Spelltracker <span class="opacity-50">by Bear</span></p>
        <p class="text-xs">A small and simple app to track spell list and slots.</p>
    </div>

    <div class="flex gap-4 justify-between my-8">
        <div class="space-y-2 ">
            <p class="uppercase opacity-75 text-xs tracking-widest">Links</p>
            <ul class="space-y-1">
                <li><a class="anchor" href="/">Home</a></li>
                <li><a class="anchor" href="/spells">Spells</a></li>
            </ul>
        </div>
        <div class="space-y-2">
            <p class="uppercase opacity-75 tracking-widest text-xs">Characters</p>
            <ul class="space-y-1">
                {#if (app.current.characters ?? []).length > 0}
                    {#each app.current.characters ?? [] as c}
                        <li><a class="anchor" href={`/characters/${c.id}`}>{c.name}</a></li>
                    {/each}
                {:else}
                    <li class="text-surface-500-200">No characters yet</li>
                {/if}
            </ul>
        </div>
    </div>
    <div class="flex items-center justify-between text-xs opacity-50">
        <span>Spell Tracker by Bear</span>
        <span>Made for quick table use</span>
    </div>
</footer>
