<script lang="ts">
	import type { Character } from "$lib/types/character";
	import { DND_CLASSES, getSpellSlotsForLevel } from "$lib/utils/constants";

	interface Props {
		character?: Character;
		onSubmit: (character: Omit<Character, "id">) => void;
		onCancel: () => void;
	}

	let { character, onSubmit, onCancel }: Props = $props();

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
        <label for="character-name" class="block text-sm font-medium mb-1">
            Character Name <span class="text-red-500">*</span>
        </label>
        <input id="character-name" type="text" bind:value={name} placeholder="Enter character name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
    </div>

    <div>
        <label for="character-class" class="block text-sm font-medium mb-1">
            Class <span class="text-red-500">*</span>
        </label>
        <select id="character-class" bind:value={selectedClass} required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Select a class</option>
            {#each DND_CLASSES as dndClass}
                <option value={dndClass}>{dndClass}</option>
            {/each}
        </select>
    </div>

    <div>
        <label for="character-level" class="block text-sm font-medium mb-1">
            Level <span class="text-red-500">*</span>
        </label>
        <input id="character-level" type="number" bind:value={level} min="1" max="20" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        <p class="text-xs text-gray-500 mt-1">Level 1-20</p>
    </div>

    <div class="flex gap-3 pt-4">
        <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {character ? "Update" : "Create"} Character
        </button>
        <button type="button" onclick={onCancel} class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"> Cancel </button>
    </div>
</form>
