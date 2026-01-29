<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { characterStore } from "$lib/stores/characters.svelte";
    import { formatSpellLevel } from "$lib/utils/spell-formatter";
    import type { SpellSlot } from "$lib/types/character";

    const characterId = $derived(page.params.id ?? "");
    const character = $derived(characterStore.getCharacter(characterId));

    let slotEdits = $state<Record<number, SpellSlot>>({});

    $effect(() => {
        if (character) {
            slotEdits = { ...character.spellSlots };
        }
    });

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

    function handleCancel() {
        goto(`/characters/${characterId}`);
    }

    function handleSave() {
        if (!character) return;

        const newSlots = Object.fromEntries(
            Object.entries(slotEdits)
                .filter(([_, slot]) => slot.total > 0)
                .map(([level, slot]) => [level, { total: slot.total, used: Math.min(slot.used, slot.total) }]),
        );

        characterStore.updateCharacter(characterId, {
            spellSlots: newSlots,
        });

        goto(`/characters/${characterId}`);
    }
</script>

<svelte:head>
    <title>Edit Spell Slots - {character?.name || "Character"} - D&D Spelltracker</title>
</svelte:head>

{#if !character}
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="card p-8 text-center">
            <h2 class="h2 mb-2">Character Not Found</h2>
            <p class="opacity-75 mb-4">The character you're looking for doesn't exist.</p>
            <button onclick={() => goto("/characters")} class="btn preset-filled-primary-500"> Back to Characters </button>
        </div>
    </div>
{:else}
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Breadcrumb -->
        <nav class="mb-6 text-sm">
            <ol class="flex items-center gap-2 opacity-75">
                <li><a href="/characters" class="hover:opacity-100">Characters</a></li>
                <li>/</li>
                <li>
                    <a href="/characters/{characterId}" class="hover:opacity-100">{character.name}</a>
                </li>
                <li>/</li>
                <li class="opacity-100">Edit Spell Slots</li>
            </ol>
        </nav>

        <!-- Header -->
        <div class="mb-6">
            <h1 class="h1">Edit Spell Slots</h1>
            <p class="opacity-75 mt-2">Configure spell slots for <strong>{character.name}</strong></p>
        </div>

        <!-- Edit Form -->
        <div class="card p-6 mb-4">
            <p class="text-sm opacity-75 mb-4">Set the total number of spell slots for each level. Remove a level by deleting it or setting it to 0.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as level}
                    {@const currentSlot = slotEdits[level]}
                    {#if currentSlot}
                        <div class="flex items-center gap-3">
                            <span class="shrink-0 w-24 font-medium">
                                {formatSpellLevel(level)}
                            </span>
                            <input type="number" min="0" max="20" value={currentSlot.total} oninput={(e) => updateSlotTotal(level, parseInt(e.currentTarget.value) || 0)} class="input flex-1" />
                            <button onclick={() => removeSpellSlotLevel(level)} class="btn preset-tonal text-sm" title="Remove this level"> ✕ </button>
                        </div>
                    {/if}
                {/each}
            </div>

            <!-- Add Level Buttons -->
            <div class="mt-6 pt-6 border-t border-surface-300-600-token">
                <p class="text-sm opacity-75 mb-3">Add spell slot level:</p>
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

        <!-- Actions -->
        <div class="flex gap-3">
            <button onclick={handleSave} class="btn preset-filled-primary-500"> Save Changes </button>
            <button onclick={handleCancel} class="btn preset-tonal"> Cancel </button>
        </div>
    </div>
{/if}
