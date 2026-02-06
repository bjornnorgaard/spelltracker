import type {SpellSlot} from "$lib/types/spellSlot";
import type {SpellEvent} from "$lib/types/spellEvent";

/**
 * Character with spellcasting abilities
 */
export interface Character {
    id: string;
    name: string;
    class: string;
    level: number;
    spellSlots: SpellSlot[];
    knownSpells: string[]; // spell IDs
    spellEvents: SpellEvent[];
}


