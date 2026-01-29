<script lang="ts">
    import type { Character } from "$lib/types/character";
    import { formatSpellLevel } from "$lib/utils/spell-formatter";

    interface Props {
        character: Character;
        isActive?: boolean;
        onSelect?: (id: string) => void;
        onEdit?: (id: string) => void;
        onDelete?: (id: string) => void;
    }

    let { character, isActive = false, onSelect, onEdit, onDelete }: Props = $props();

    // Calculate total and used spell slots
    let totalSlots = $derived(Object.values(character.spellSlots).reduce((sum, slot) => sum + slot.total, 0));
    let usedSlots = $derived(Object.values(character.spellSlots).reduce((sum, slot) => sum + slot.used, 0));
    let availableSlots = $derived(totalSlots - usedSlots);
</script>

<div
    role="button"
    tabindex="0"
    class="card p-4 border-2 transition-all cursor-pointer hover:shadow-lg"
    class:border-blue-500={isActive}
    class:bg-blue-50={isActive}
    class:border-gray-200={!isActive}
    onclick={() => onSelect?.(character.id)}
    onkeydown={(e) => e.key === 'Enter' && onSelect?.(character.id)}>
    <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
            <h3 class="text-lg font-bold">
                {character.name}
            </h3>
            <p class="text-sm text-gray-600">
                Level {character.level}
                {character.class}
            </p>
        </div>
        {#if isActive}
            <span class="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded"> Active </span>
        {/if}
    </div>

    <div class="grid grid-cols-3 gap-2 mb-3 text-center text-sm">
        <div class="bg-gray-100 p-2 rounded">
            <div class="font-semibold text-gray-700">{character.knownSpells.length}</div>
            <div class="text-xs text-gray-500">Spells</div>
        </div>
        <div class="bg-green-100 p-2 rounded">
            <div class="font-semibold text-green-700">{availableSlots}</div>
            <div class="text-xs text-green-600">Available</div>
        </div>
        <div class="bg-red-100 p-2 rounded">
            <div class="font-semibold text-red-700">{usedSlots}</div>
            <div class="text-xs text-red-600">Used</div>
        </div>
    </div>

    {#if Object.keys(character.spellSlots).length > 0}
        <div class="mb-3">
            <div class="text-xs text-gray-600 mb-1">Spell Slots:</div>
            <div class="flex flex-wrap gap-1">
                {#each Object.entries(character.spellSlots) as [level, slot]}
                    <span class="text-xs px-2 py-1 bg-gray-200 rounded">
                        {formatSpellLevel(Number(level))}: {slot.total - slot.used}/{slot.total}
                    </span>
                {/each}
            </div>
        </div>
    {/if}

    {#if onEdit || onDelete}
        <div class="flex gap-2 pt-2 border-t">
            {#if onEdit}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onEdit(character.id);
                    }}
                    class="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Edit
                </button>
            {/if}
            {#if onDelete}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onDelete(character.id);
                    }}
                    class="flex-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Delete
                </button>
            {/if}
        </div>
    {/if}
</div>
