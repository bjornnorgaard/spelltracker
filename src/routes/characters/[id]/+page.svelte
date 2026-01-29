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

    function handleEditSlots() {
        goto(`/characters/${characterId}/slots/edit`);
    }

    function handleImportSpells() {
        goto(`/characters/${characterId}/spells/import`);
    }

    function useSpellSlot(level: number) {
        if (!character) return;
        const slot = character.spellSlots[level];
        if (!slot || slot.used >= slot.total) return;

        characterStore.updateCharacter(characterId, {
            spellSlots: {
                ...character.spellSlots,
                [level]: { ...slot, used: slot.used + 1 },
            },
        });
    }

    function restoreSpellSlot(level: number) {
        if (!character) return;
        const slot = character.spellSlots[level];
        if (!slot || slot.used === 0) return;

        characterStore.updateCharacter(characterId, {
            spellSlots: {
                ...character.spellSlots,
                [level]: { ...slot, used: slot.used - 1 },
            },
        });
    }

    function longRest() {
        if (!character) return;

        const resetSlots = Object.fromEntries(
            Object.entries(character.spellSlots).map(([level, slot]) => [
                level,
                {
                    ...slot,
                    used: 0,
                },
            ]),
        );

        characterStore.updateCharacter(characterId, {
            spellSlots: resetSlots,
        });
    }
</script>

<svelte:head>
    <title>{character?.name ?? "Character"} - D&D Spelltracker</title>
</svelte:head>

<div class="flex flex-col gap-4">
    <button onclick={handleBack}> ← Back to Characters</button>

    {#if !character}
        <div class="card p-4 text-center">
            <div class="flex flex-col gap-4 items-center">
                <h2 class="h2">Character Not Found</h2>
                <p>The character you're looking for doesn't exist.</p>
                <button onclick={handleBack} class="btn"> Back to Characters</button>
            </div>
        </div>
    {:else}
        <div class="flex flex-col gap-4 justify-between">
            <div>
                <h1 class="h1">{character.name}</h1>
                <p>Level {character.level} {character.class}</p>
            </div>
            <div class="flex gap-4 justify-end">
                <button onclick={handleEdit} class="btn">Edit</button>
                <button onclick={handleImportSpells} class="btn">Import Spells</button>
            </div>
        </div>

        <!-- Spell Slots -->
        <div class="card p-4">
            <div class="flex flex-col gap-4">
                <div class="flex justify-between items-center">
                    <h2 class="h2">Spell Slots</h2>
                    <div class="flex gap-4">
                        {#if Object.keys(character.spellSlots).length > 0}
                            <button onclick={longRest} class="btn text-sm">
                                <span class="mr-1">🌙</span>
                                Long Rest
                            </button>
                        {/if}
                        <button onclick={handleEditSlots} class="btn text-sm"> Edit Slots </button>
                    </div>
                </div>

                {#if Object.keys(character.spellSlots).length === 0}
                    <div class="card p-4 text-center">
                        <div class="flex flex-col gap-4 items-center">
                            <p>No spell slots configured</p>
                            <button onclick={handleEditSlots} class="btn"> Add Spell Slots </button>
                        </div>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each Object.entries(character.spellSlots) as [level, slot]}
                            <div class="card p-4">
                                <div class="flex flex-col gap-4">
                                    <div class="flex justify-between items-start">
                                        <div class="text-sm font-semibold">
                                            {formatSpellLevel(Number(level))}
                                        </div>
                                        <div class="text-lg font-bold">
                                            {slot.total - slot.used}/{slot.total}
                                        </div>
                                    </div>

                                    <!-- Slot Indicators -->
                                    <div class="flex gap-1">
                                        {#each Array(slot.total) as _, index}
                                            <div class="flex-1 h-2 {index < slot.total - slot.used ? 'bg-black' : 'bg-gray-300'}"></div>
                                        {/each}
                                    </div>

                                    <!-- Controls -->
                                    <div class="flex gap-4">
                                        <button onclick={() => useSpellSlot(Number(level))} disabled={slot.used >= slot.total} class="btn flex-1 text-sm" title="Use spell slot"> Use </button>
                                        <button onclick={() => restoreSpellSlot(Number(level))} disabled={slot.used === 0} class="btn flex-1 text-sm" title="Restore spell slot"> Restore </button>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Known Spells -->
        <div class="flex flex-col gap-4">
            \n <h2 class="h2">\n Known Spells ({character.knownSpells.length})\n</h2>
            {#if knownSpells.length === 0}
                <div class="card p-4 text-center">
                    <div class="flex flex-col gap-4 items-center">
                        <p class="opacity-75">No spells known yet</p>
                        <button onclick={handleImportSpells} class="btn preset-filled-primary-500"> Import Spells </button>
                    </div>
                </div>
            {:else}
                <div class="flex flex-col gap-4">
                    {#each knownSpells as spell}
                        <div class="card p-4 cursor-pointer">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-semibold">{spell.name}</h3>
                                    <p class="text-sm">
                                        {formatSpellLevel(spell.level)}
                                        {spell.school}
                                    </p>
                                </div>
                                <span class="text-xs">
                                    {spell.castingTime}
                                </span>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>
