/**
 * Spell slot information for a specific spell level
 */
export interface SpellSlot {
    level: number; // 0 = Cantrip, 1-9 = spell levels
    total: number;
    used: number;
}