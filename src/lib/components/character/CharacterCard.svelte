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
    class="card p-4 transition-all cursor-pointer hover:shadow-lg"
    class:preset-tonal-primary={isActive}
    onclick={() => onSelect?.(character.id)}
    onkeydown={(e) => e.key === "Enter" && onSelect?.(character.id)}>
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
            <span class="badge preset-filled"> Active </span>
        {/if}
    </div>

    <div class="grid grid-cols-3 gap-2 mb-3 text-center text-sm">
        <div class="card preset-tonal-surface p-2">
            <div class="font-semibold">{character.knownSpells.length}</div>
            <div class="text-xs opacity-75">Spells</div>
        </div>
        <div class="card preset-tonal-success p-2">
            <div class="font-semibold">{availableSlots}</div>
            <div class="text-xs opacity-75">Available</div>
        </div>
        <div class="card preset-tonal-error p-2">
            <div class="font-semibold">{usedSlots}</div>
            <div class="text-xs opacity-75">Used</div>
        </div>
    </div>

    {#if Object.keys(character.spellSlots).length > 0}
        <div class="mb-3">
            <div class="text-xs opacity-75 mb-1">Spell Slots:</div>
            <div class="flex flex-wrap gap-1">
                {#each Object.entries(character.spellSlots) as [level, slot]}
                    <span class="chip preset-tonal text-xs">
                        {formatSpellLevel(Number(level))}: {slot.total - slot.used}/{slot.total}
                    </span>
                {/each}
            </div>
        </div>
    {/if}

    {#if onEdit || onDelete}
        <div class="flex gap-2 pt-2">
            {#if onEdit}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onEdit(character.id);
                    }}
                    class="btn preset-filled-primary-500 flex-1 text-sm">
                    Edit
                </button>
            {/if}
            {#if onDelete}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onDelete(character.id);
                    }}
                    class="btn preset-filled-error-500 flex-1 text-sm">
                    Delete
                </button>
            {/if}
        </div>
    {/if}
</div>
