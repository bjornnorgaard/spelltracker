<script lang="ts">
    import { page } from "$app/state";
    import { characterStore } from "$lib/stores/characters.svelte";
    import { spellStore } from "$lib/stores/spells.svelte";
    import { formatSpellLevel } from "$lib/utils/spell-formatter";
    import { goto } from "$app/navigation";
    import type { SpellSlot } from "$lib/types/character";

    let characterId = $derived(page.params.id ?? "");
    let character = $derived(characterStore.getCharacter(characterId));
    let knownSpells = $derived(character ? character.knownSpells.map((id) => spellStore.getSpell(id)).filter((s) => s !== undefined) : []);

    let editingSlots = $state(false);
    let slotEdits = $state<Record<number, SpellSlot>>({});

    function handleBack() {
        goto("/characters");
    }

    function handleEdit() {
        goto(`/characters/${characterId}/edit`);
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

        const resetSlots = Object.fromEntries(Object.entries(character.spellSlots).map(([level, slot]) => [level, { ...slot, used: 0 }]));

        characterStore.updateCharacter(characterId, {
            spellSlots: resetSlots,
        });
    }

    function startEditingSlots() {
        if (!character) return;
        slotEdits = { ...character.spellSlots };
        editingSlots = true;
    }

    function cancelEditingSlots() {
        editingSlots = false;
        slotEdits = {};
    }

    function saveSlotEdits() {
        if (!character) return;

        const newSlots = Object.fromEntries(
            Object.entries(slotEdits)
                .filter(([_, slot]) => slot.total > 0)
                .map(([level, slot]) => [level, { total: slot.total, used: Math.min(slot.used, slot.total) }]),
        );

        characterStore.updateCharacter(characterId, {
            spellSlots: newSlots,
        });

        editingSlots = false;
        slotEdits = {};
    }

    function updateSlotTotal(level: number, total: number) {
        const currentSlot = slotEdits[level] || { total: 0, used: 0 };
        slotEdits = {
            ...slotEdits,
            [level]: { ...currentSlot, total: Math.max(0, total) },
        };
    }

    function addSpellSlotLevel(level: number) {
        if (slotEdits[level]) return;
        slotEdits = {
            ...slotEdits,
            [level]: { total: 1, used: 0 },
        };
    }

    function removeSpellSlotLevel(level: number) {
        const newEdits = { ...slotEdits };
        delete newEdits[level];
        slotEdits = newEdits;
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
                    <div class="flex justify-between items-center mb-3">
                        <h2 class="h2">Spell Slots</h2>
                        <div class="flex gap-2">
                            {#if !editingSlots && Object.keys(character.spellSlots).length > 0}
                                <button onclick={longRest} class="btn preset-tonal text-sm">
                                    <span class="mr-1">🌙</span>
                                    Long Rest
                                </button>
                            {/if}
                            {#if !editingSlots}
                                <button onclick={startEditingSlots} class="btn preset-tonal text-sm"> Edit Slots </button>
                            {:else}
                                <button onclick={cancelEditingSlots} class="btn preset-tonal text-sm"> Cancel </button>
                                <button onclick={saveSlotEdits} class="btn preset-filled-primary-500 text-sm"> Save </button>
                            {/if}
                        </div>
                    </div>

                    {#if editingSlots}
                        <!-- Edit Mode -->
                        <div class="card p-4 mb-4 bg-surface-100-800-token">
                            <p class="text-sm opacity-75 mb-4">Set the total number of spell slots for each level. Set to 0 to remove a level.</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as level}
                                    {@const currentSlot = slotEdits[level]}
                                    {#if currentSlot}
                                        <div class="flex items-center gap-3">
                                            <span class="shrink-0 w-24 font-medium">
                                                {formatSpellLevel(level)}
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                value={currentSlot.total}
                                                oninput={(e) => updateSlotTotal(level, parseInt(e.currentTarget.value) || 0)}
                                                class="input flex-1" />
                                            <button onclick={() => removeSpellSlotLevel(level)} class="btn preset-tonal text-sm" title="Remove this level"> ✕ </button>
                                        </div>
                                    {/if}
                                {/each}
                            </div>

                            <!-- Add Level Buttons -->
                            <div class="mt-4 pt-4 border-t border-surface-300-600-token">
                                <p class="text-sm opacity-75 mb-2">Add spell slot level:</p>
                                <div class="flex flex-wrap gap-2">
                                    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as level}
                                        {#if !slotEdits[level]}
                                            <button onclick={() => addSpellSlotLevel(level)} class="btn preset-tonal text-sm">
                                                {formatSpellLevel(level)}
                                            </button>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {:else if Object.keys(character.spellSlots).length === 0}
                        <div class="card p-8 text-center">
                            <p class="opacity-75 mb-4">No spell slots configured</p>
                            <button onclick={startEditingSlots} class="btn preset-filled-primary-500"> Add Spell Slots </button>
                        </div>
                    {:else}
                        <!-- View Mode -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {#each Object.entries(character.spellSlots) as [level, slot]}
                                <div class="card p-4">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="text-sm font-semibold opacity-75">
                                            {formatSpellLevel(Number(level))}
                                        </div>
                                        <div class="text-lg font-bold">
                                            {slot.total - slot.used}/{slot.total}
                                        </div>
                                    </div>

                                    <!-- Slot Indicators -->
                                    <div class="flex gap-1 mb-3">
                                        {#each Array(slot.total) as _, index}
                                            <div class="flex-1 h-2 rounded-full {index < slot.total - slot.used ? 'preset-filled-primary-500' : 'bg-surface-400-500-token'}"></div>
                                        {/each}
                                    </div>

                                    <!-- Controls -->
                                    <div class="flex gap-2">
                                        <button
                                            onclick={() => useSpellSlot(Number(level))}
                                            disabled={slot.used >= slot.total}
                                            class="btn preset-filled-primary-500 flex-1 text-sm"
                                            title="Use spell slot">
                                            Use
                                        </button>
                                        <button onclick={() => restoreSpellSlot(Number(level))} disabled={slot.used === 0} class="btn preset-tonal flex-1 text-sm" title="Restore spell slot">
                                            Restore
                                        </button>
                                    </div>
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
