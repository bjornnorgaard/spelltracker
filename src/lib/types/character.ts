import type { SpellSlot } from "$lib/types/spellSlot";
import type { FreeCastSpell } from "$lib/types/freeCastSpell";
import type { SpellNote } from "$lib/types/spellNote";

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
    concentrationSpellId: string | null;
    freePerLongRestSpells: FreeCastSpell[];
    freePerShortRestSpells: FreeCastSpell[];
}
