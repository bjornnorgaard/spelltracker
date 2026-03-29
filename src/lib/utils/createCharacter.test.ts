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

    it("initializes custom resources list", () => {
        const character = createCharacter();

        expect(Array.isArray(character.customResources)).toBe(true);
    });
});
