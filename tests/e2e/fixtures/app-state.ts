import {
    DEFAULT_SPELLCASTING_ABILITY,
    DEFAULT_SPELLCASTING_ABILITY_SCORE
} from "../../../src/lib/utils/constants";

export const testSpells = [
    {
        id: "fire-bolt-phb",
        name: "Fire Bolt",
        source: "PHB",
        page: "1",
        level: 0,
        castingTime: "1 action",
        duration: "Instantaneous",
        school: "Evocation",
        ritual: false,
        range: "120 feet",
        components: "V, S",
        classes: ["Wizard"],
        subclasses: "",
        text: "A mote of fire.",
        atHigherLevels: "",
    },
    {
        id: "detect-magic-phb",
        name: "Detect Magic",
        source: "PHB",
        page: "2",
        level: 1,
        castingTime: "1 action",
        duration: "Concentration, up to 10 minutes",
        school: "Divination",
        ritual: true,
        range: "Self",
        components: "V, S",
        classes: ["Wizard"],
        subclasses: "",
        text: "Sense magic.",
        atHigherLevels: "",
    },
];

export const seededCharacter = {
    id: "char-wizard-1",
    name: "Test Wizard",
    class: "Wizard",
    spellcastingAbility: DEFAULT_SPELLCASTING_ABILITY,
    spellcastingAbilityScore: DEFAULT_SPELLCASTING_ABILITY_SCORE,
    level: 5,
    spellSlots: [
        { level: 0, total: 0, used: 0 },
        { level: 1, total: 4, used: 0 },
        { level: 2, total: 3, used: 0 },
        { level: 3, total: 2, used: 0 },
        { level: 4, total: 0, used: 0 },
        { level: 5, total: 0, used: 0 },
        { level: 6, total: 0, used: 0 },
        { level: 7, total: 0, used: 0 },
        { level: 8, total: 0, used: 0 },
        { level: 9, total: 0, used: 0 },
    ],
    spellNotes: [],
    selectedSpellIds: ["fire-bolt-phb", "detect-magic-phb"],
    preparedSpellIds: ["detect-magic-phb"],
    preparedSpellsLimit: 3,
    alwaysPreparedSpellIds: [],
    concentrationSpellId: null,
    freePerLongRestSpells: [],
    freePerShortRestSpells: [],
    customResources: [],
};

export function localStorageSeed(data: { spells?: unknown[]; characters?: unknown[] }) {
    return [
        { key: "spelltracker:spells", value: JSON.stringify(data.spells ?? []) },
        { key: "spelltracker:characters", value: JSON.stringify(data.characters ?? []) },
    ];
}
