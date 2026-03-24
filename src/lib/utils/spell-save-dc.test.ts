import { describe, expect, it } from "vitest";

import {
    calculateSpellSaveDc,
    getAbilityModifier,
    getProficiencyBonusForLevel,
} from "$lib/utils/spell-save-dc";

describe("getProficiencyBonusForLevel", () => {
    it("returns expected D&D proficiency bonuses across tiers", () => {
        expect(getProficiencyBonusForLevel(1)).toBe(2);
        expect(getProficiencyBonusForLevel(5)).toBe(3);
        expect(getProficiencyBonusForLevel(9)).toBe(4);
        expect(getProficiencyBonusForLevel(13)).toBe(5);
        expect(getProficiencyBonusForLevel(17)).toBe(6);
    });

    it("clamps and normalizes invalid values", () => {
        expect(getProficiencyBonusForLevel(0)).toBe(2);
        expect(getProficiencyBonusForLevel(25)).toBe(6);
        expect(getProficiencyBonusForLevel(7.9)).toBe(3);
        expect(getProficiencyBonusForLevel(Number.NaN)).toBe(2);
    });
});

describe("getAbilityModifier", () => {
    it("converts ability scores to modifiers", () => {
        expect(getAbilityModifier(8)).toBe(-1);
        expect(getAbilityModifier(10)).toBe(0);
        expect(getAbilityModifier(12)).toBe(1);
        expect(getAbilityModifier(18)).toBe(4);
    });

    it("defaults invalid scores to 0", () => {
        expect(getAbilityModifier(Number.NaN)).toBe(0);
    });
});

describe("calculateSpellSaveDc", () => {
    it("applies the base formula", () => {
        expect(calculateSpellSaveDc({ proficiencyBonus: 3, spellcastingAbilityModifier: 4 })).toBe(15);
    });

    it("includes optional bonuses", () => {
        expect(calculateSpellSaveDc({ proficiencyBonus: 4, spellcastingAbilityModifier: 5, bonus: 1 })).toBe(18);
    });
});
