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
    <div class="flex flex-col gap-4">
        <div class="card p-4 text-center">
            <div class="flex flex-col gap-4 items-center">
                <h2 class="h2">Character Not Found</h2>
                <p>The character you're looking for doesn't exist.</p>
                <button onclick={() => goto("/characters")} class="btn"> Back to Characters </button>
            </div>
        </div>
    </div>
{:else}
    <div class="flex flex-col gap-4">
        <!-- Breadcrumb -->
        <nav class="text-sm">
            <ol class="flex items-center gap-4">
                <li><a href="/characters">Characters</a></li>
                <li>/</li>
                <li>
                    <a href="/characters/{characterId}">{character.name}</a>
                </li>
                <li>/</li>
                <li>Edit Spell Slots</li>
            </ol>
        </nav>

        <!-- Header -->
        <div>
            <h1 class="h1">Edit Spell Slots</h1>
            <p>Configure spell slots for <strong>{character.name}</strong></p>
        </div>

        <!-- Edit Form -->
        <div class="card p-4">
            <div class="flex flex-col gap-4">
                <p class="text-sm">Set the total number of spell slots for each level. Remove a level by deleting it or setting it to 0.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as level}
                        {@const currentSlot = slotEdits[level]}
                        {#if currentSlot}
                            <div class="flex items-center gap-4">
                                <span class="shrink-0 w-24 font-medium">
                                    {formatSpellLevel(level)}
                                </span>
                                <input type="number" min="0" max="20" value={currentSlot.total} oninput={(e) => updateSlotTotal(level, parseInt(e.currentTarget.value) || 0)} class="input flex-1" />
                                <button onclick={() => removeSpellSlotLevel(level)} class="btn text-sm" title="Remove this level"> ✕ </button>
                            </div>
                        {/if}
                    {/each}
                </div>

                <!-- Add Level Buttons -->
                <div class="card p-4">
                    <div class="flex flex-col gap-4">
                        <p class="text-sm">Add spell slot level:</p>
                        <div class="flex flex-wrap gap-4">
                            {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as level}
                                {#if !slotEdits[level]}
                                    <button onclick={() => addSpellSlotLevel(level)} class="btn text-sm">
                                        {formatSpellLevel(level)}
                                    </button>
                                {/if}
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
            <button onclick={handleSave} class="btn"> Save Changes </button>
            <button onclick={handleCancel} class="btn"> Cancel </button>
        </div>
    </div>
{/if}
