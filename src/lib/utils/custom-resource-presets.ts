import type { Character } from "$lib/types/character";
import type { CustomResource } from "$lib/types/customResource";
import { getAbilityModifier, getProficiencyBonusForLevel } from "$lib/utils/spell-save-dc";

const SORCERY_POINTS_NAME = "Sorcery Points";
const ARCANE_RECOVERY_NAME = "Arcane Recovery";
const CHANNEL_DIVINITY_NAME = "Channel Divinity";
const WILD_SHAPE_NAME = "Wild Shape";
const BARDIC_INSPIRATION_NAME = "Bardic Inspiration";
const PACT_SLOTS_NAME = "Pact Slots";
const FLASH_OF_GENIUS_NAME = "Flash of Genius";
const CLASS_PRESET_RESOURCE_NAMES: Record<string, string[]> = {
    Sorcerer: [SORCERY_POINTS_NAME],
    Wizard: [ARCANE_RECOVERY_NAME],
    Cleric: [CHANNEL_DIVINITY_NAME],
    Paladin: [CHANNEL_DIVINITY_NAME],
    Druid: [WILD_SHAPE_NAME],
    Bard: [BARDIC_INSPIRATION_NAME],
    Warlock: [PACT_SLOTS_NAME],
    Artificer: [FLASH_OF_GENIUS_NAME],
};
const ALL_PRESET_RESOURCE_NAMES = new Set<string>([
    SORCERY_POINTS_NAME,
    ARCANE_RECOVERY_NAME,
    CHANNEL_DIVINITY_NAME,
    WILD_SHAPE_NAME,
    BARDIC_INSPIRATION_NAME,
    PACT_SLOTS_NAME,
    FLASH_OF_GENIUS_NAME,
]);

function clampToNonNegativeInt(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.floor(value));
}

function upsertClassResource(
    resources: CustomResource[],
    name: string,
    targetMax: number,
    currentOnCreate?: number
) {
    const normalizedMax = clampToNonNegativeInt(targetMax);
    const index = resources.findIndex((resource) => resource.name === name);

    if (index === -1) {
        resources.push({
            id: crypto.randomUUID(),
            name,
            current: Math.min(clampToNonNegativeInt(currentOnCreate ?? normalizedMax), normalizedMax),
            max: normalizedMax,
        });
        return;
    }

    const existing = resources[index];
    resources[index] = {
        ...existing,
        max: normalizedMax,
        current: Math.min(clampToNonNegativeInt(existing.current), normalizedMax),
    };
}

function getChannelDivinityMax(level: number): number {
    if (level >= 18) return 3;
    if (level >= 6) return 2;
    return 1;
}

function getWarlockPactSlots(level: number): number {
    if (level >= 17) return 4;
    if (level >= 11) return 3;
    if (level >= 2) return 2;
    return 1;
}

export function applyClassResourcePresets(character: Character): Character {
    const currentClassPresetNames = new Set<string>(CLASS_PRESET_RESOURCE_NAMES[character.class] ?? []);

    const nextResources: CustomResource[] = [...(character.customResources ?? [])].filter(
        (resource) => !ALL_PRESET_RESOURCE_NAMES.has(resource.name) || currentClassPresetNames.has(resource.name)
    );

    if (character.class === "Sorcerer") {
        upsertClassResource(nextResources, SORCERY_POINTS_NAME, character.level);
    }

    if (character.class === "Wizard") {
        upsertClassResource(nextResources, ARCANE_RECOVERY_NAME, 1);
    }

    if (character.class === "Cleric" || character.class === "Paladin") {
        upsertClassResource(nextResources, CHANNEL_DIVINITY_NAME, getChannelDivinityMax(character.level));
    }

    if (character.class === "Druid") {
        upsertClassResource(nextResources, WILD_SHAPE_NAME, 2);
    }

    if (character.class === "Bard") {
        upsertClassResource(nextResources, BARDIC_INSPIRATION_NAME, getProficiencyBonusForLevel(character.level));
    }

    if (character.class === "Warlock") {
        upsertClassResource(nextResources, PACT_SLOTS_NAME, getWarlockPactSlots(character.level));
    }

    if (character.class === "Artificer") {
        const flashOfGeniusMax = character.level >= 7 ? Math.max(1, getAbilityModifier(character.spellcastingAbilityScore)) : 0;
        upsertClassResource(nextResources, FLASH_OF_GENIUS_NAME, flashOfGeniusMax);
    }

    character.customResources = nextResources;
    return character;
}
