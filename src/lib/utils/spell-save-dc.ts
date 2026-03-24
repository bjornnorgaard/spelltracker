export interface SpellSaveDcInput {
    proficiencyBonus: number;
    spellcastingAbilityModifier: number;
    bonus?: number;
}

/**
 * D&D 5e proficiency bonus progression by character level.
 */
export function getProficiencyBonusForLevel(level: number): number {
    if (!Number.isFinite(level)) {
        return 2;
    }

    const clampedLevel = Math.max(1, Math.min(20, Math.floor(level)));
    return 2 + Math.floor((clampedLevel - 1) / 4);
}

/**
 * Converts an ability score to its D&D 5e modifier.
 */
export function getAbilityModifier(score: number): number {
    if (!Number.isFinite(score)) {
        return 0;
    }

    return Math.floor((score - 10) / 2);
}

/**
 * Spell save DC formula:
 * 8 + proficiency bonus + spellcasting ability modifier + optional bonuses
 */
export function calculateSpellSaveDc(input: SpellSaveDcInput): number {
    const bonus = input.bonus ?? 0;
    return 8 + input.proficiencyBonus + input.spellcastingAbilityModifier + bonus;
}
