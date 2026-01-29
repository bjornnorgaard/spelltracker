/**
 * Spell slot information for a specific spell level
 */
export interface SpellSlot {
    total: number;
    used: number;
}

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
    preparedSpells?: string[]; // for prepared casters (optional)
}
