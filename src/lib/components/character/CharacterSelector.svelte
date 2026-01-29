<script lang="ts">
    import type { Character } from "$lib/types/character";

    interface Props {
        characters: Character[];
        activeCharacterId: string | null;
        onSelect: (id: string) => void;
    }

    let { characters, activeCharacterId, onSelect }: Props = $props();

    let activeCharacter = $derived(characters.find((c) => c.id === activeCharacterId));
</script>

<div class="character-selector">
    {#if characters.length === 0}
        <div class="text-center py-4 text-gray-500">
            <p class="text-sm">No characters yet</p>
            <p class="text-xs mt-1">Create your first character to get started</p>
        </div>
    {:else}
        <label for="character-select" class="block text-sm font-medium mb-2"> Active Character </label>
        <select
            id="character-select"
            value={activeCharacterId ?? ""}
            onchange={(e) => {
                const value = e.currentTarget.value;
                if (value) onSelect(value);
            }}
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
            {#if !activeCharacterId}
                <option value="">Select a character</option>
            {/if}
            {#each characters as character}
                <option value={character.id}>
                    {character.name} (Level {character.level}
                    {character.class})
                </option>
            {/each}
        </select>

        {#if activeCharacter}
            <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="text-sm">
                    <div class="font-semibold text-blue-900">{activeCharacter.name}</div>
                    <div class="text-blue-700 text-xs">
                        Level {activeCharacter.level}
                        {activeCharacter.class}
                    </div>
                    <div class="text-blue-600 text-xs mt-1">
                        {activeCharacter.knownSpells.length} spells known
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>
