import type {Character} from "$lib/types/character";
import {DND_CLASSES, SPELL_LEVELS} from "$lib/utils/constants";

export function createCharacter(): Character {
    const newCharacter: Character = {
        id: crypto.randomUUID(),
        name: randomName(),
        class: DND_CLASSES[Math.floor(Math.random() * DND_CLASSES.length)],
        level: 1,
        spellSlots: [],
        spellIds: [],
        preparedLimit: 1,
        preparedSpellIds: []
    };

    for (const spellLevel of SPELL_LEVELS) {
        newCharacter.spellSlots[spellLevel] = {
            level: spellLevel,
            used: 0,
            total: 0,
        };
    }

    return newCharacter;
}

function randomName() {
    const adjectives = ["Brave", "Daring", "Fierce", "Gentle", "Hasty", "Jolly", "Naive", "Quick", "Rash", "Sneaky", "Steady", "Swift"];
    const nouns = ["Bear", "Cat", "Dog", "Eagle", "Fox", "Lion", "Monkey", "Owl", "Panda", "Rat", "Tiger"];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective} ${noun}`;
}