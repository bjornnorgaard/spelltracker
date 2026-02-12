import type { SpellSlot } from "$lib/types/spellSlot";
import type { FreeCastSpell } from "$lib/types/freeCastSpell";
import type { SpellNote } from "$lib/types/spellNote";

export interface Character {
    id: string;
    name: string;
    class: string;
    level: number;
    spellSlots: SpellSlot[];
    spellNotes: SpellNote[];
    selectedSpellIds: string[];
    preparedSpellIds: string[];
    preparedSpellsLimit: number;
    alwaysPreparedSpellIds: string[];
    concentrationSpellId: string | null;
    freePerLongRestSpells: FreeCastSpell[];
    freePerShortRestSpells: FreeCastSpell[];
}
