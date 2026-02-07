<script lang="ts">
    import "./layout.css";
    import {app} from "$lib/stores/app.svelte";

    let {children} = $props();
</script>

<div class="min-h-screen flex flex-col">
    <header class="p-4">
        <a href="/">
            <p class="preset-typo-headline">Spelltracker <span class="opacity-25 font-serif font-thin ml-1">by Bear</span></p>
        </a>
    </header>

    <main class="mx-auto max-w-xl p-4 flex-1 w-full">
        {@render children()}
    </main>

    <footer class="opacity-70 preset-filled-surface-100-900 mt-16 pb-4 space-y-4">
        <div class="p-4 sm:p-8 md:px-16 lg:max-w-7xl mx-auto">
            <div>
                <p class="preset-typo-title">Spelltracker by Bear</p>
                <p class="preset-typo-caption">Manage spells and spell-slots.</p>
            </div>

            <div class="flex gap-4 justify-between sm:justify-start sm:gap-16 md:gap-32 my-8">
                <div class="space-y-2 ">
                    <p class="uppercase text-xs tracking-widest">Links</p>
                    <ul class="space-y-1">
                        <li><a class="anchor" href="/">Home</a></li>
                        <li><a class="anchor" href="/backup">Backup</a></li>
                    </ul>
                </div>
                <div class="space-y-2">
                    <p class="uppercase tracking-widest text-xs">Characters</p>
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
            <div class="flex items-center justify-between preset-typo-caption">
                <span>For D&D 5th Edition Spellcasters</span>
            </div>
        </div>
    </footer>
</div>
