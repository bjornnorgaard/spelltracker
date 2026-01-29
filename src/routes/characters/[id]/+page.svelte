<script lang="ts">
    import { page } from "$app/state";
    import { characterStore } from "$lib/stores/characters.svelte";
    import { spellStore } from "$lib/stores/spells.svelte";
    import { formatSpellLevel } from "$lib/utils/spell-formatter";
    import { goto } from "$app/navigation";

    let characterId = $derived(page.params.id ?? "");
    let character = $derived(characterStore.getCharacter(characterId));
    let knownSpells = $derived(character ? character.knownSpells.map((id) => spellStore.getSpell(id)).filter((s) => s !== undefined) : []);

    function handleBack() {
        goto("/characters");
    }

    function handleEdit() {
        goto(`/characters/${characterId}/edit`);
    }

    function handleImportSpells() {
        goto(`/characters/${characterId}/spells/import`);
    }
</script>

<svelte:head>
    <title>{character?.name ?? "Character"} - D&D Spelltracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    {#if !character}
        <div class="card p-12 text-center">
            <h2 class="h2 mb-4">Character Not Found</h2>
            <p class="opacity-75 mb-6">The character you're looking for doesn't exist.</p>
            <button onclick={handleBack} class="btn preset-filled-primary-500"> Back to Characters </button>
        </div>
    {:else}
        <div class="mb-6">
            <button onclick={handleBack} class="hover:opacity-100 opacity-75 mb-4 inline-flex items-center"> ← Back to Characters </button>

            <div class="card p-6">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h1 class="h1">{character.name}</h1>
                        <p class="text-xl opacity-75 mt-1">
                            Level {character.level}
                            {character.class}
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick={handleEdit} class="btn preset-tonal">Edit</button>
                        <button onclick={handleImportSpells} class="btn preset-filled-primary-500"> Import Spells </button>
                    </div>
                </div>

                <!-- Spell Slots -->
                <div class="mb-6">
                    <h2 class="h2 mb-3">Spell Slots</h2>
                    {#if Object.keys(character.spellSlots).length === 0}
                        <p class="opacity-75">No spell slots available</p>
                    {:else}
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {#each Object.entries(character.spellSlots) as [level, slot]}
                                <div class="card p-4">
                                    <div class="text-sm opacity-75">
                                        {formatSpellLevel(Number(level))}
                                    </div>
                                    <div class="text-2xl font-bold mt-1">
                                        {slot.total - slot.used}/{slot.total}
                                    </div>
                                    <div class="text-xs opacity-75">Available</div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Known Spells -->
                <div>
                    <h2 class="h2 mb-3">
                        Known Spells ({character.knownSpells.length})
                    </h2>
                    {#if knownSpells.length === 0}
                        <div class="card p-8 text-center">
                            <p class="opacity-75 mb-4">No spells known yet</p>
                            <button onclick={handleImportSpells} class="btn preset-filled-primary-500"> Import Spells </button>
                        </div>
                    {:else}
                        <div class="space-y-2">
                            {#each knownSpells as spell}
                                <div class="card p-4 hover:preset-tonal transition-colors cursor-pointer">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h3 class="font-semibold">{spell.name}</h3>
                                            <p class="text-sm opacity-75">
                                                {formatSpellLevel(spell.level)}
                                                {spell.school}
                                            </p>
                                        </div>
                                        <span class="chip preset-tonal text-xs">
                                            {spell.castingTime}
                                        </span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
