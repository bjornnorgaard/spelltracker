import type { Character } from "$lib/types/character";
import {
    DEFAULT_SPELLCASTING_ABILITY,
    DEFAULT_SPELLCASTING_ABILITY_SCORE,
    DND_CLASSES,
    SPELL_LEVELS
} from "$lib/utils/constants";
import { applyClassResourcePresets } from "$lib/utils/custom-resource-presets";

export function createCharacter(): Character {
    const newCharacter: Character = {
        id: crypto.randomUUID(),
        name: randomName(),
        class: DND_CLASSES[Math.floor(Math.random() * DND_CLASSES.length)],
        spellcastingAbility: DEFAULT_SPELLCASTING_ABILITY,
        spellcastingAbilityScore: DEFAULT_SPELLCASTING_ABILITY_SCORE,
        level: 1,
        spellSlots: [],
        spellNotes: [],
        selectedSpellIds: [],
        preparedSpellsLimit: 1,
        preparedSpellIds: [],
        alwaysPreparedSpellIds: [],
        concentrationSpellId: null,
        freePerLongRestSpells: [],
        freePerShortRestSpells: [],
        customResources: [],
    };

    for (const spellLevel of SPELL_LEVELS) {
        newCharacter.spellSlots[spellLevel] = {
            level: spellLevel,
            used: 0,
            total: 0,
        };
    }

    return applyClassResourcePresets(newCharacter);
}

function randomName() {
    const adjectives = ["Brave", "Daring", "Fierce", "Gentle", "Hasty", "Jolly", "Naive", "Quick", "Rash", "Sneaky", "Steady", "Swift"];
    const nouns = ["Bear", "Cat", "Dog", "Eagle", "Fox", "Lion", "Monkey", "Owl", "Panda", "Rat", "Tiger"];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective} ${noun}`;
}
