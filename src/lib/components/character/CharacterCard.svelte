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
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 mb-4">
        <div class="flex-1">
            <h3 class="text-lg font-bold">
                {character.name}
            </h3>
            <p class="text-sm opacity-75">
                Level {character.level} {character.class}
            </p>
        </div>
        {#if isActive}
            <span class="badge preset-filled text-xs"> Active </span>
        {/if}
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
        <div class="card preset-tonal p-2">
            <div class="font-semibold">{character.knownSpells.length}</div>
            <div class="text-xs opacity-75">Spells</div>
        </div>
        <div class="card preset-tonal p-2">
            <div class="font-semibold">{availableSlots}</div>
            <div class="text-xs opacity-75">Available</div>
        </div>
        <div class="card preset-tonal p-2">
            <div class="font-semibold">{usedSlots}</div>
            <div class="text-xs opacity-75">Used</div>
        </div>
    </div>

    <!-- Spell Slots Visualization -->
    {#if Object.keys(character.spellSlots).length > 0}
        <div class="space-y-2 mb-4">
            <div class="text-xs font-semibold opacity-75 mb-2">Spell Slots</div>
            {#each Object.entries(character.spellSlots) as [level, slot]}
                <div class="flex items-center gap-2">
                    <div class="text-xs font-medium opacity-75 w-8 shrink-0">
                        {formatSpellLevel(Number(level))}
                    </div>
                    <div class="flex-1 flex items-center gap-1">
                        {#each Array(slot.total) as _, i}
                            {#if i >= slot.used}
                                <!-- Available slot: filled -->
                                <div class="text-center flex-1 rounded-full preset-filled-primary-500 transition-all">
                                    {level}
                                </div>
                            {:else}
                                <!-- Used slot: outlined -->
                                <div class="text-center flex-1 rounded-full preset-outlined opacity-50 transition-all">
                                    {level}
                                </div>
                            {/if}
                        {/each}
                    </div>
                    <div class="text-xs opacity-50 w-10 text-right shrink-0">
                        {slot.total - slot.used}/{slot.total}
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Actions -->
    {#if onEdit || onDelete}
        <div class="flex flex-col sm:flex-row gap-2 pt-3">
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
                    class="btn preset-tonal flex-1 text-sm">
                    Delete
                </button>
            {/if}
        </div>
    {/if}
</div>
