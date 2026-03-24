import { describe, expect, it } from "vitest";

import { getSavingThrowAbility, spellRequiresSavingThrow } from "$lib/utils/spell-save-parser";

describe("spellRequiresSavingThrow", () => {
    it("returns true when spell text references a saving throw", () => {
        expect(
            spellRequiresSavingThrow({
                text: "Each creature must make a Dexterity saving throw.",
                atHigherLevels: "",
            }),
        ).toBe(true);
    });

    it("returns false when no saving throw is mentioned", () => {
        expect(
            spellRequiresSavingThrow({
                text: "You teleport up to 30 feet.",
                atHigherLevels: "",
            }),
        ).toBe(false);
    });
});

describe("getSavingThrowAbility", () => {
    it("extracts the save ability from text", () => {
        expect(
            getSavingThrowAbility({
                text: "Target must make a Constitution saving throw.",
                atHigherLevels: "",
            }),
        ).toBe("Constitution");
    });

    it("can read from atHigherLevels when needed", () => {
        expect(
            getSavingThrowAbility({
                text: "Creatures are affected by this spell.",
                atHigherLevels: "At higher levels, target must make a Wisdom saving throw.",
            }),
        ).toBe("Wisdom");
    });

    it("returns null when no specific save ability is found", () => {
        expect(
            getSavingThrowAbility({
                text: "The target makes a saving throw.",
                atHigherLevels: "",
            }),
        ).toBeNull();
    });
});
