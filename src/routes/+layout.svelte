<script lang="ts">
    import "./layout.css";
    import {app} from "$lib/stores/app.svelte";
    import {onMount} from "svelte";
    import {DND_CLASSES} from "$lib/utils/constants";

    let {children} = $props();

    onMount(() => {
        // Cheap version of migration.
        // If the field was introduced after character creation, it will be added with an empty value.
        // Every field on the character type should have a default value.
        for (let c of app.current.characters) {
            if (!c.id) c.id = crypto.randomUUID();
            if (!c.name) c.name = "John Doe";
            if (!c.class) c.class = DND_CLASSES[0];
            if (!c.level) c.level = 1;
            if (!c.spellIds) c.spellIds = [];
            if (!c.spellSlots) c.spellSlots = [];
            if (!c.spellNotes) c.spellNotes = [];
            if (!c.preparedLimit) c.preparedLimit = 42;
            if (!c.preparedSpellIds) c.preparedSpellIds = [];
            if (!c.concentrationSpellId) c.concentrationSpellId = null;
            if (!c.freePerLongRestSpells) c.freePerLongRestSpells = [];
            if (!c.freePerShortRestSpells) c.freePerShortRestSpells = [];
        }
    });
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

    <footer class="opacity-70 preset-filled-surface-100-900 pb-4 space-y-4">
        <div class="p-4 sm:p-8 md:px-16 lg:max-w-7xl mx-auto">
            <div>
                <p class="preset-typo-body-2">Spelltracker by Bear</p>
                <p class="preset-typo-caption">Manage spells and spell-slots.</p>
            </div>

            <div class="flex gap-4 justify-between sm:justify-start sm:gap-16 md:gap-32 my-8">
                <div class="space-y-2">
                    <p class="uppercase text-xs tracking-widest">Links</p>
                    <ul class="space-y-1">
                        <li><a class="anchor" href="/">Home</a></li>
                        <li><a class="anchor" href="/backup">Backup</a></li>
                        <li><a class="anchor" href="/spells">Spells</a></li>
                        <li><a class="anchor" href="/settings">Settings</a></li>
                        <li><a class="anchor" href="/debug">Debug</a></li>
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
