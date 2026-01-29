<script lang="ts">
    import { page } from "$app/state";
    import { characterStore } from "$lib/stores/characters.svelte";
    import { spellStore } from "$lib/stores/spells.svelte";
    import { formatSpellLevel } from "$lib/utils/spell-formatter";
    import { goto } from "$app/navigation";

    let characterId = $derived(page.params.id ?? '');
    let character = $derived(characterStore.getCharacter(characterId));
    let knownSpells = $derived(character ? character.knownSpells.map((id) => spellStore.getSpell(id)).filter((s) => s !== undefined) : []);

    function handleBack() {
        goto("/characters");
    }

    function handleEdit() {
        goto(`/characters/${characterId}/edit`);
    }
</script>

<svelte:head>
    <title>{character?.name ?? "Character"} - D&D Spelltracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    {#if !character}
        <div class="text-center py-12">
            <h2 class="text-2xl font-bold text-gray-700 mb-4">Character Not Found</h2>
            <p class="text-gray-600 mb-6">The character you're looking for doesn't exist.</p>
            <button onclick={handleBack} class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"> Back to Characters </button>
        </div>
    {:else}
        <div class="mb-6">
            <button onclick={handleBack} class="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"> ← Back to Characters </button>

            <div class="border rounded-lg p-4 shadow-sm">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h1 class="text-3xl font-bold">{character.name}</h1>
                        <p class="text-xl text-gray-600 mt-1">
                            Level {character.level}
                            {character.class}
                        </p>
                    </div>
                    <button onclick={handleEdit} class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"> Edit </button>
                </div>

                <!-- Spell Slots -->
                <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-3">Spell Slots</h2>
                    {#if Object.keys(character.spellSlots).length === 0}
                        <p class="text-gray-500">No spell slots available</p>
                    {:else}
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {#each Object.entries(character.spellSlots) as [level, slot]}
                                <div class="border rounded-lg p-3">
                                    <div class="text-sm font-medium text-gray-600">
                                        {formatSpellLevel(Number(level))}
                                    </div>
                                    <div class="text-2xl font-bold mt-1">
                                        {slot.total - slot.used}/{slot.total}
                                    </div>
                                    <div class="text-xs text-gray-500">Available</div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Known Spells -->
                <div>
                    <h2 class="text-lg font-semibold mb-3">
                        Known Spells ({character.knownSpells.length})
                    </h2>
                    {#if knownSpells.length === 0}
                        <p class="text-gray-500">No spells known yet</p>
                    {:else}
                        <div class="space-y-2">
                            {#each knownSpells as spell}
                                <div class="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h3 class="font-semibold">{spell.name}</h3>
                                            <p class="text-sm text-gray-600">
                                                {formatSpellLevel(spell.level)}
                                                {spell.school}
                                            </p>
                                        </div>
                                        <span class="text-xs px-2 py-1 bg-gray-200 rounded">
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
