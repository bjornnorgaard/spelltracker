import { describe, expect, it } from "vitest";

import { createCharacter } from "$lib/utils/createCharacter";
import {
    DEFAULT_SPELLCASTING_ABILITY,
    DEFAULT_SPELLCASTING_ABILITY_SCORE,
    SPELLCASTING_ABILITIES
} from "$lib/utils/constants";

describe("createCharacter", () => {
    it("defaults spellcasting ability to Intelligence", () => {
        const character = createCharacter();

        expect(character.spellcastingAbility).toBe(DEFAULT_SPELLCASTING_ABILITY);
    });

    it("uses a valid spellcasting ability value", () => {
        const character = createCharacter();

        expect(SPELLCASTING_ABILITIES).toContain(character.spellcastingAbility);
    });

    it("defaults spellcasting ability score", () => {
        const character = createCharacter();

        expect(character.spellcastingAbilityScore).toBe(DEFAULT_SPELLCASTING_ABILITY_SCORE);
    });

    it("defaults custom resources to an empty list", () => {
        const character = createCharacter();

        expect(character.customResources).toEqual([]);
    });
});
