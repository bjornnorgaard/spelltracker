import type {SpellSlot} from "$lib/types/spellSlot";

/**
 * Character with spellcasting abilities
 */
export interface Character {
    id: string;
    name: string;
    class: string;
    level: number;
    spellSlots: Record<number, SpellSlot>;
    knownSpells: string[]; // spell IDs
}


