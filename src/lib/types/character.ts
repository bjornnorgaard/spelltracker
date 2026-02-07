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
    slots: SpellSlot[];
    spellIds: string[]; // spell IDs
    events: SpellEvent[];
}


