<script lang="ts">
    import type {Character} from "$lib/types/character";
    import {DND_CLASSES, getSpellSlotsForLevel} from "$lib/utils/constants";

    interface Props {
        character?: Character;
        onSubmit: (character: Omit<Character, "id">) => void;
        onCancel: () => void;
    }

    let {character, onSubmit, onCancel}: Props = $props();

    let name = $state("");
    let selectedClass = $state("");
    let level = $state(1);

    // Update form fields when character prop changes
    $effect(() => {
        name = character?.name ?? "";
        selectedClass = character?.class ?? "";
        level = character?.level ?? 1;
    });

    function handleSubmit(e: Event) {
        e.preventDefault();

        if (!name.trim() || !selectedClass) {
            return;
        }

        // Generate spell slots based on level
        const slotCounts = getSpellSlotsForLevel(level);
        const spellSlots: Record<number, { total: number; used: number }> = {};

        onSubmit({
            name: name.trim(),
            class: selectedClass,
            level,
            spellSlots,
            knownSpells: character?.knownSpells ?? [],
            preparedSpells: character?.preparedSpells,
        });
    }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
    <div>
        <label for="character-name" class="label">
            Character Name <span class="text-red-500">*</span>
        </label>
        <input id="character-name" type="text" autocomplete="off" bind:value={name} placeholder="Enter character name" required
               class="input"/>
    </div>

    <div>
        <label for="character-class" class="label">
            Class <span class="text-red-500">*</span>
        </label>
        <select id="character-class" bind:value={selectedClass} required class="select">
            <option value="">Select a class</option>
            {#each DND_CLASSES as dndClass}
                <option value={dndClass}>{dndClass}</option>
            {/each}
        </select>
    </div>

    <div>
        <label for="character-level" class="label">
            Level <span class="text-red-500">*</span>
        </label>
        <input id="character-level" type="number" bind:value={level} min="1" max="20" required class="input"/>
        <p class="text-xs opacity-75 mt-1">Level 1-20</p>
    </div>

    <div class="flex gap-3 pt-4">
        <button type="submit" class="btn preset-filled-primary-500 flex-1">
            {character ? "Update" : "Create"} Character
        </button>
        <button type="button" onclick={onCancel} class="btn preset-tonal flex-1"> Cancel</button>
    </div>
</form>
