import type {SpellSlot} from "$lib/types/spellSlot";

/**
 * Character with spellcasting abilities
 */
export interface Character {
    id: string;
    name: string;
    class: string;
    level: number;
    spellIds: string[];
    spellSlots: SpellSlot[];
    preparedLimit: number;
    preparedSpellIds: string[];
}


