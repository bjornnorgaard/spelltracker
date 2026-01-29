/**
 * D&D 5e Spell Schools
 */
export const SPELL_SCHOOLS = [
    'Abjuration',
    'Conjuration',
    'Divination',
    'Enchantment',
    'Evocation',
    'Illusion',
    'Necromancy',
    'Transmutation'
] as const;

export type SpellSchool = (typeof SPELL_SCHOOLS)[number];

/**
 * D&D 5e Classes (PHB'24)
 */
export const DND_CLASSES = [
    'Artificer',
    'Barbarian',
    'Bard',
    'Cleric',
    'Druid',
    'Fighter',
    'Monk',
    'Paladin',
    'Ranger',
    'Rogue',
    'Sorcerer',
    'Warlock',
    'Wizard'
] as const;

export type DnDClass = (typeof DND_CLASSES)[number];

/**
 * Spell levels (0 = Cantrip, 1-9 = Spell levels)
 */
export const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type SpellLevel = (typeof SPELL_LEVELS)[number];

/**
 * Spell casting times
 */
export const CASTING_TIMES = [
    'Action',
    'Bonus',
    'Reaction',
    '1 Minute',
    '10 Minutes',
    '1 Hour',
    '8 Hours',
    '12 Hours',
    '24 Hours'
] as const;

/**
 * Component types
 */
export const COMPONENTS = ['V', 'S', 'M'] as const;

/**
 * Standard spell slot progression by class level
 * Index 0 = level 1, index 19 = level 20
 * Each array represents spell slots for levels 1-9
 */
export const SPELL_SLOTS_BY_LEVEL: Record<number, number[]> = {
    1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
    10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
    11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

/**
 * Get spell slots for a given character level
 */
export function getSpellSlotsForLevel(level: number): number[] {
    if (level < 1 || level > 20) {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    return SPELL_SLOTS_BY_LEVEL[level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
}
