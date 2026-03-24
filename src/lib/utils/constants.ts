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
 * Core spellcasting abilities used for spell save calculations
 */
export const SPELLCASTING_ABILITIES = ['Intelligence', 'Wisdom', 'Charisma'] as const;
export type SpellcastingAbility = (typeof SPELLCASTING_ABILITIES)[number];
export const DEFAULT_SPELLCASTING_ABILITY: SpellcastingAbility = SPELLCASTING_ABILITIES[0];

/**
 * Spell levels (0 = Cantrip, 1-9 = Spell levels)
 */
export const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
