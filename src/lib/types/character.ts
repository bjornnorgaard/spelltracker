import type {SpellSlot} from "$lib/types/spellSlot";
import type {FreeCast} from "$lib/types/freeCast";
import type {SpellNote} from "$lib/types/spellNote";

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
    spellNotes: SpellNote[];
    preparedLimit: number;
    preparedSpellIds: string[];
    freePerLongRestSpells: FreeCast[];
    freePerShortRestSpells: FreeCast[];
}

