import { describe, expect, it } from "vitest";

import type { Character } from "$lib/types/character";
import { applyClassResourcePresets } from "$lib/utils/custom-resource-presets";
import { DEFAULT_SPELLCASTING_ABILITY, DEFAULT_SPELLCASTING_ABILITY_SCORE } from "$lib/utils/constants";

function makeCharacter(overrides: Partial<Character> = {}): Character {
    return {
        id: "c1",
        name: "Test",
        class: "Wizard",
        spellcastingAbility: DEFAULT_SPELLCASTING_ABILITY,
        spellcastingAbilityScore: DEFAULT_SPELLCASTING_ABILITY_SCORE,
        level: 5,
        spellSlots: [],
        spellNotes: [],
        selectedSpellIds: [],
        preparedSpellIds: [],
        preparedSpellsLimit: 1,
        alwaysPreparedSpellIds: [],
        concentrationSpellId: null,
        freePerLongRestSpells: [],
        freePerShortRestSpells: [],
        customResources: [],
        ...overrides,
    };
}

describe("applyClassResourcePresets", () => {
    it("adds sorcery points for sorcerer and sets max/current to level", () => {
        const character = makeCharacter({ class: "Sorcerer", level: 7 });
        applyClassResourcePresets(character);

        expect(character.customResources).toHaveLength(1);
        expect(character.customResources[0].name).toBe("Sorcery Points");
        expect(character.customResources[0].max).toBe(7);
        expect(character.customResources[0].current).toBe(7);
    });

    it("updates existing sorcery points max when level changes", () => {
        const character = makeCharacter({
            class: "Sorcerer",
            level: 3,
            customResources: [{ id: "r1", name: "Sorcery Points", current: 8, max: 8 }],
        });
        applyClassResourcePresets(character);

        expect(character.customResources[0].max).toBe(3);
        expect(character.customResources[0].current).toBe(3);
    });

    it("adds arcane recovery for wizard", () => {
        const character = makeCharacter({ class: "Wizard", level: 6 });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([
            expect.objectContaining({ name: "Arcane Recovery", current: 1, max: 1 }),
        ]);
    });

    it("adds channel divinity for cleric and scales by level", () => {
        const character = makeCharacter({ class: "Cleric", level: 6 });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([
            expect.objectContaining({ name: "Channel Divinity", current: 2, max: 2 }),
        ]);
    });

    it("adds channel divinity for paladin", () => {
        const character = makeCharacter({ class: "Paladin", level: 3 });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([
            expect.objectContaining({ name: "Channel Divinity", current: 1, max: 1 }),
        ]);
    });

    it("adds wild shape for druid", () => {
        const character = makeCharacter({ class: "Druid", level: 5 });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([
            expect.objectContaining({ name: "Wild Shape", current: 2, max: 2 }),
        ]);
    });

    it("adds bardic inspiration based on proficiency bonus", () => {
        const character = makeCharacter({ class: "Bard", level: 9 });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([
            expect.objectContaining({ name: "Bardic Inspiration", current: 4, max: 4 }),
        ]);
    });

    it("adds pact slots for warlock based on level", () => {
        const character = makeCharacter({ class: "Warlock", level: 12 });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([
            expect.objectContaining({ name: "Pact Slots", current: 3, max: 3 }),
        ]);
    });

    it("adds flash of genius for artificer at level 7+", () => {
        const character = makeCharacter({
            class: "Artificer",
            level: 10,
            spellcastingAbilityScore: 18,
        });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([
            expect.objectContaining({ name: "Flash of Genius", current: 4, max: 4 }),
        ]);
    });

    it("does not exceed max when resource is already present", () => {
        const character = makeCharacter({
            class: "Bard",
            level: 5,
            customResources: [{ id: "r1", name: "Bardic Inspiration", current: 99, max: 99 }],
        });
        applyClassResourcePresets(character);

        expect(character.customResources[0]).toEqual(
            expect.objectContaining({ name: "Bardic Inspiration", current: 3, max: 3 })
        );
    });

    it("does nothing for non-preset classes", () => {
        const character = makeCharacter({ class: "Ranger", level: 6 });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([]);
    });

    it("removes preset resources from previous class when class changes", () => {
        const character = makeCharacter({
            class: "Bard",
            level: 5,
            customResources: [{ id: "r1", name: "Arcane Recovery", current: 1, max: 1 }],
        });
        applyClassResourcePresets(character);

        expect(character.customResources).toEqual([
            expect.objectContaining({ name: "Bardic Inspiration", current: 3, max: 3 }),
        ]);
    });
});
