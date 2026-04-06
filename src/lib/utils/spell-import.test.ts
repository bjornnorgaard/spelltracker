import { describe, expect, it } from "vitest";

import {
    buildSpellFromCsvRow,
    createSourceEntries,
    normalizeClassName,
    makeSpellId,
    parseSpellClasses,
    enrichSpellsWithLookupClasses,
    getSpellIndexUrlFromRepositoryUrl,
    getSpellSourceLookupUrl,
    selectAllSources,
    selectRecommendedSources,
    sourceFileToUrl,
    splitCommaValues,
    spellMatchesSubclassFilters,
    splitSpellSubclassLabels,
    subclassLabelClassPrefix,
    subclassLabelStripClassPrefix,
    spellListHasLookupSubclassLabels,
    spellsSuggestSubclassReimport,
    type SourceEntry,
    upsertSpellsByNameSource,
} from "$lib/utils/spell-import";
import type { Spell } from "$lib/types/spell";
import { convertSpellCsvRows } from "$lib/types/spell";

describe("sourceFileToUrl", () => {
    it("resolves source file paths relative to the index URL", () => {
        const result = sourceFileToUrl(
            "spells-phb.json",
            "https://raw.githubusercontent.com/example/repo/refs/heads/main/data/spells/index.json"
        );

        expect(result).toBe("https://raw.githubusercontent.com/example/repo/refs/heads/main/data/spells/spells-phb.json");
    });

    it("returns the original filename when URL resolution fails", () => {
        const result = sourceFileToUrl("spells-phb.json", "not-a-valid-url");

        expect(result).toBe("spells-phb.json");
    });
});

describe("getSpellSourceLookupUrl", () => {
    it("derives generated lookup URL from spells index URL", () => {
        const indexUrl = "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/spells/index.json";
        const result = getSpellSourceLookupUrl(indexUrl);

        expect(result).toBe(
            "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/generated/gendata-spell-source-lookup.json"
        );
    });
});

describe("getSpellIndexUrlFromRepositoryUrl", () => {
    it("derives spells index URL from github repo URL", () => {
        const repositoryUrl = "https://github.com/5etools-mirror-3/5etools-src";
        const result = getSpellIndexUrlFromRepositoryUrl(repositoryUrl);

        expect(result).toBe(
            "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/spells/index.json"
        );
    });

    it("uses branch from github tree URL", () => {
        const repositoryUrl = "https://github.com/5etools-mirror-3/5etools-src/tree/dev";
        const result = getSpellIndexUrlFromRepositoryUrl(repositoryUrl);

        expect(result).toBe(
            "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/dev/data/spells/index.json"
        );
    });

    it("supports owner/repo shorthand input", () => {
        const repositoryUrl = "5etools-mirror-3/5etools-src";
        const result = getSpellIndexUrlFromRepositoryUrl(repositoryUrl);

        expect(result).toBe(
            "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/spells/index.json"
        );
    });
});

describe("createSourceEntries", () => {
    const indexUrl = "https://raw.githubusercontent.com/example/repo/refs/heads/main/data/spells/index.json";

    it("creates selectable source entries from payload", () => {
        const payload = {
            TCE: "spells-tce.json",
            XGE: "spells-xge.json",
        };

        const result = createSourceEntries(payload, indexUrl);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            source: "TCE",
            fileName: "spells-tce.json",
            url: "https://raw.githubusercontent.com/example/repo/refs/heads/main/data/spells/spells-tce.json",
            selected: true,
        });
    });

    it("throws when payload is not an object", () => {
        expect(() => createSourceEntries([], indexUrl)).toThrow(
            "The index file must be a JSON object of source-to-file mappings."
        );
    });

    it("throws when no valid source mappings exist", () => {
        expect(() => createSourceEntries({ TCE: 42 }, indexUrl)).toThrow(
            "No source files were found in this index."
        );
    });
});

describe("splitCommaValues", () => {
    it("splits and trims comma-separated values", () => {
        expect(splitCommaValues("Wizard, Sorcerer, Bard")).toEqual(["Wizard", "Sorcerer", "Bard"]);
    });

    it("removes empty values", () => {
        expect(splitCommaValues("Wizard, ,  ,Bard")).toEqual(["Wizard", "Bard"]);
    });
});

describe("buildSpellFromCsvRow", () => {
    it("maps CSV row values into a Spell object", () => {
        const spell = buildSpellFromCsvRow({
            name: "Fireball",
            source: "XPHB",
            page: "241",
            level: "3rd",
            castingTime: "1 action",
            duration: "Instantaneous",
            school: "Evocation",
            range: "150 feet",
            components: "V, S, M",
            classes: "Wizard, Sorcerer",
            optionalVariantClasses: "",
            subclasses: "",
            text: "A bright streak flashes...",
            atHigherLevels: "Damage increases by 1d6.",
        });

        expect(spell.id).toBe("fireball-xphb");
        expect(spell.level).toBe(3);
        expect(spell.classes).toEqual(["Wizard", "Sorcerer"]);
        expect(spell.subclasses).toBe("");
    });

    it("normalizes classes and includes optional variant classes", () => {
        const spell = buildSpellFromCsvRow({
            name: "Detect Magic",
            source: "XPHB",
            page: "262",
            level: "1st",
            castingTime: "1 action",
            duration: "Concentration, up to 10 minutes",
            school: "Divination",
            range: "Self",
            components: "V, S",
            classes: "Cleric (PHB'24), Wizard (PHB'24)",
            optionalVariantClasses: "Wizard (PHB'24), Artificer (EFA)",
            subclasses: "",
            text: "For the duration...",
            atHigherLevels: "",
        });

        expect(spell.classes).toEqual(["Cleric", "Wizard", "Artificer"]);
    });
});

describe("makeSpellId", () => {
    it("creates a URL-safe id with source suffix", () => {
        expect(makeSpellId("Fireball", "XPHB")).toBe("fireball-xphb");
    });

    it("replaces spaces with dashes and strips non-url-safe characters", () => {
        expect(makeSpellId("Abi-Dalzim's Horrid Wilting", "PHB'24")).toBe("abi-dalzims-horrid-wilting-phb24");
    });
});

describe("class parsing helpers", () => {
    it("normalizeClassName removes trailing source parentheses", () => {
        expect(normalizeClassName("Wizard (PHB'24)")).toBe("Wizard");
        expect(normalizeClassName("Sorcerer")).toBe("Sorcerer");
    });

    it("parseSpellClasses merges, normalizes, and deduplicates", () => {
        const result = parseSpellClasses(
            "Wizard (PHB'24), Sorcerer (PHB'24)",
            "Wizard (PHB'24), Artificer (EFA)",
        );

        expect(result).toEqual(["Wizard", "Sorcerer", "Artificer"]);
    });

    it("parseSpellClasses handles array-like inputs and subclass fallback", () => {
        const result = parseSpellClasses(
            ["Wizard (PHB'24)", "Sorcerer (PHB'24)"],
            null,
            "Cleric (PHB'24): Life Domain (PHB'24); Wizard (PHB'24): Bladesinging (TCE)",
        );

        expect(result).toEqual(["Wizard", "Sorcerer", "Cleric"]);
    });
});

describe("example-data import smoke", () => {
    it("converts example-data-shaped source rows into spells with classes as string arrays", () => {
        const fixtureJson = JSON.stringify({
            spell: [
                {
                    name: "Acid Splash",
                    source: "PHB",
                    page: 211,
                    level: 0,
                    school: "C",
                    time: [{ number: 1, unit: "action" }],
                    range: { type: "point", distance: { type: "feet", amount: 60 } },
                    components: { v: true, s: true },
                    duration: [{ type: "instant" }],
                    entries: ["You hurl a bubble of acid."],
                },
                {
                    name: "Detect Magic",
                    source: "XPHB",
                    page: 262,
                    level: 1,
                    school: "D",
                    meta: { ritual: true },
                    time: [{ number: 1, unit: "action" }],
                    range: { type: "point", distance: { type: "self" } },
                    components: { v: true, s: true },
                    duration: [{ type: "timed", concentration: true, duration: { type: "minute", amount: 10 } }],
                    classes: {
                        fromClassList: [{ name: "Cleric", source: "PHB'24" }, { name: "Wizard", source: "PHB'24" }],
                    },
                    entries: ["For the duration, you sense the presence of magic."],
                },
                {
                    name: "Haste",
                    source: "XPHB",
                    page: 288,
                    level: 3,
                    school: "T",
                    time: [{ number: 1, unit: "action" }],
                    range: { type: "point", distance: { type: "feet", amount: 30 } },
                    components: { v: true, s: true, m: "a shaving of licorice root" },
                    duration: [{ type: "timed", concentration: true, duration: { type: "minute", amount: 1 } }],
                    classes: {
                        fromClassList: [{ name: "Sorcerer", source: "PHB'24" }, { name: "Wizard", source: "PHB'24" }],
                    },
                    entries: [
                        "Choose a willing creature that you can see within range. Until the spell ends, the target's {@variantrule Speed|XPHB} is doubled, it gains a +2 bonus to {@variantrule Armor Class|XPHB}, it has {@variantrule Advantage|XPHB} on Dexterity saving throws, and it gains an additional action on each of its turns. That action can be used to take only the {@action Attack|XPHB} (one attack only), {@action Dash|XPHB}, {@action Disengage|XPHB}, {@action Hide|XPHB}, or {@action Utilize|XPHB} action. When the spell ends, the target is {@condition Incapacitated|XPHB} and has a {@variantrule Speed|XPHB} of 0 until the end of its next turn, as a wave of lethargy washes over it.",
                    ],
                },
            ],
        });

        const rows = convertSpellCsvRows(fixtureJson);
        const converted = rows.slice(0, 25).map(buildSpellFromCsvRow);

        expect(converted.length).toBeGreaterThan(0);
        for (const spell of converted) {
            expect(Array.isArray(spell.classes)).toBe(true);
            expect(typeof spell.classes).toBe("object");
            expect(spell.classes.every((className) => typeof className === "string")).toBe(true);
        }

        const acidSplash = converted.find((spell) => spell.name === "Acid Splash");
        const detectMagic = converted.find((spell) => spell.name === "Detect Magic");
        const haste = converted.find((spell) => spell.name === "Haste");

        expect(acidSplash?.school).toBe("Conjuration");
        expect(acidSplash?.ritual).toBe(false);
        expect(detectMagic?.school).toBe("Divination");
        expect(detectMagic?.ritual).toBe(true);
        expect(haste?.school).toBe("Transmutation");
        expect(haste?.text).toContain("Disengage");
        expect(haste?.text).toContain("Incapacitated");
        expect(haste?.text).not.toContain("{@");
        expect(haste?.text).not.toContain("|XPHB");
    });
});

describe("lookup class enrichment", () => {
    it("enriches imported spell classes using source lookup payload", () => {
        const lookupPayload = {
            phb: {
                "acid splash": {
                    class: {
                        PHB: {
                            Wizard: true,
                            Sorcerer: true,
                        },
                        XPHB: {
                            Wizard: true,
                        },
                    },
                },
            },
        };

        const baseSpell: Spell = {
            id: "acid-splash-phb",
            name: "Acid Splash",
            source: "PHB",
            page: "211",
            level: 0,
            castingTime: "1 action",
            duration: "Instantaneous",
            school: "Conjuration",
            ritual: false,
            range: "60 feet",
            components: "V, S",
            classes: [],
            subclasses: "",
            text: "You hurl a bubble of acid.",
            atHigherLevels: "",
        };

        const result = enrichSpellsWithLookupClasses([baseSpell], lookupPayload);

        expect(result[0].classes).toEqual(["Wizard", "Sorcerer"]);
    });

    it("enriches classes from classVariant when class is missing (Control Flames case)", () => {
        const lookupPayload = {
            xge: {
                "control flames": {
                    classVariant: {
                        XPHB: {
                            Sorcerer: true,
                            Wizard: true,
                        },
                    },
                },
            },
        };

        const baseSpell: Spell = {
            id: "control-flames-xge",
            name: "Control Flames",
            source: "XGE",
            page: "152",
            level: 0,
            castingTime: "1 action",
            duration: "Instantaneous",
            school: "Transmutation",
            ritual: false,
            range: "60 feet",
            components: "S",
            classes: [],
            subclasses: "",
            text: "You choose nonmagical flame that you can see.",
            atHigherLevels: "",
        };

        const result = enrichSpellsWithLookupClasses([baseSpell], lookupPayload);

        expect(result[0].classes).toEqual(["Sorcerer", "Wizard"]);
    });

    it("enriches subclasses from lookup subclass tree (5etools-style)", () => {
        const lookupPayload = {
            phb: {
                "jim's magic missile": {
                    class: {
                        PHB: {Wizard: true},
                    },
                    subclass: {
                        XPHB: {
                            Bard: {
                                XPHB: {
                                    Lore: {name: "College of Lore"},
                                },
                            },
                            Wizard: {
                                XPHB: {
                                    Evoker: {name: "Evoker"},
                                },
                            },
                        },
                    },
                },
            },
        };

        const baseSpell: Spell = {
            id: "jims-magic-missile-phb",
            name: "Jim's Magic Missile",
            source: "PHB",
            page: "1",
            level: 1,
            castingTime: "1 action",
            duration: "Instantaneous",
            school: "Evocation",
            ritual: false,
            range: "120 feet",
            components: "V, S",
            classes: ["Wizard"],
            subclasses: "",
            text: "…",
            atHigherLevels: "",
        };

        const result = enrichSpellsWithLookupClasses([baseSpell], lookupPayload);

        expect(result[0].subclasses).toContain("Bard: College of Lore");
        expect(result[0].subclasses).toContain("Wizard: Evoker");
    });
});

describe("splitSpellSubclassLabels and spellMatchesSubclassFilters", () => {
    it("splits subclass strings on commas and semicolons", () => {
        expect(splitSpellSubclassLabels("Bard: Lore; Wizard: Evoker")).toEqual(["Bard: Lore", "Wizard: Evoker"]);
        expect(splitSpellSubclassLabels("Foo, Bar")).toEqual(["Foo", "Bar"]);
    });

    it("subclassLabelClassPrefix reads class name before colon", () => {
        expect(subclassLabelClassPrefix("Bard: College of Lore")).toBe("Bard");
        expect(subclassLabelClassPrefix("Arcane Trickster Rogue")).toBe(null);
    });

    it("subclassLabelStripClassPrefix drops the class when it matches forClass", () => {
        expect(subclassLabelStripClassPrefix("Paladin: Oath of Conquest", "Paladin")).toBe("Oath of Conquest");
        expect(subclassLabelStripClassPrefix("Paladin: Oath of Conquest", "Bard")).toBe("Paladin: Oath of Conquest");
    });

    it("spellListHasLookupSubclassLabels and spellsSuggestSubclassReimport detect enriched data", () => {
        const empty: Spell[] = [];
        expect(spellListHasLookupSubclassLabels(empty)).toBe(false);
        expect(spellsSuggestSubclassReimport(empty)).toBe(false);

        const legacyOnly: Spell[] = [
            {
                id: "a",
                name: "A",
                source: "PHB",
                page: "1",
                level: 0,
                castingTime: "1",
                duration: "1",
                school: "Evocation",
                ritual: false,
                range: "60",
                components: "V",
                classes: ["Wizard"],
                subclasses: "Some legacy text without colon class form",
                text: "t",
                atHigherLevels: "",
            },
        ];
        expect(spellListHasLookupSubclassLabels(legacyOnly)).toBe(false);
        expect(spellsSuggestSubclassReimport(legacyOnly)).toBe(true);

        const withLookup: Spell[] = [
            {
                ...legacyOnly[0],
                subclasses: "Wizard: Evoker",
            },
        ];
        expect(spellListHasLookupSubclassLabels(withLookup)).toBe(true);
        expect(spellsSuggestSubclassReimport(withLookup)).toBe(false);
    });

    it("matches subclass filter tokens against spell text", () => {
        expect(spellMatchesSubclassFilters("Bard: College of Lore; Fighter: Eldritch Knight", [])).toBe(true);
        expect(spellMatchesSubclassFilters("Bard: College of Lore", ["Bard: College of Lore"])).toBe(true);
        expect(spellMatchesSubclassFilters("Bard: College of Lore", ["Wizard: Evoker"])).toBe(false);
        expect(spellMatchesSubclassFilters("", ["Bard: College of Lore"])).toBe(false);
    });

    it("matches substring and case-insensitive tokens in subclass haystack", () => {
        expect(spellMatchesSubclassFilters("Bard: College of Lore", ["lore"])).toBe(true);
        expect(spellMatchesSubclassFilters("Bard: College of Lore", ["LORE"])).toBe(true);
        expect(spellMatchesSubclassFilters("Wizard: Evoker", ["evoker"])).toBe(true);
    });

    it("matches any segment exactly when split by comma or semicolon", () => {
        expect(spellMatchesSubclassFilters("Foo; Bar", ["bar"])).toBe(true);
        expect(spellMatchesSubclassFilters("Foo, Bar", ["foo"])).toBe(true);
    });

    it("returns true when a filter token is whitespace-only (treated as pass)", () => {
        expect(spellMatchesSubclassFilters("Bard: Lore", ["  "])).toBe(true);
    });

    it("matches if any of several filters hits (OR)", () => {
        expect(spellMatchesSubclassFilters("Bard: X", ["nope", "bard: x"])).toBe(true);
        expect(spellMatchesSubclassFilters("Bard: X", ["wizard", "sorcerer"])).toBe(false);
    });
});

describe("source selection helpers", () => {
    const entries: SourceEntry[] = [
        { source: "TCE", fileName: "spells-tce.json", url: "a", selected: false },
        { source: "PHB", fileName: "spells-phb.json", url: "b", selected: false },
        { source: "xphb", fileName: "spells-xphb.json", url: "c", selected: false },
    ];

    it("selectAllSources toggles all entries", () => {
        const selected = selectAllSources(entries, true);
        expect(selected.every((entry) => entry.selected)).toBe(true);

        const deselected = selectAllSources(entries, false);
        expect(deselected.every((entry) => !entry.selected)).toBe(true);
    });

    it("selectRecommendedSources selects only TCE, XGE, XPHB", () => {
        const selected = selectRecommendedSources(entries);

        expect(selected.find((entry) => entry.source === "TCE")?.selected).toBe(true);
        expect(selected.find((entry) => entry.source === "xphb")?.selected).toBe(true);
        expect(selected.find((entry) => entry.source === "PHB")?.selected).toBe(false);
    });
});

describe("upsertSpellsByNameSource", () => {
    it("updates existing spells and rewrites id to deterministic url-safe name-source", () => {
        const existing: Spell[] = [
            {
                id: "0f4f857d-50de-4d9d-9f7d-0672bf7b88f2",
                name: "Fireball",
                source: "XPHB",
                page: "1",
                level: 3,
                castingTime: "1 action",
                duration: "Instantaneous",
                school: "Evocation",
                ritual: false,
                range: "150 feet",
                components: "V, S, M",
                classes: ["Wizard"],
                subclasses: "",
                text: "old",
                atHigherLevels: "",
            },
        ];

        const incoming: Spell[] = [
            {
                id: "fireball-xphb",
                name: "Fireball",
                source: "XPHB",
                page: "241",
                level: 3,
                castingTime: "1 action",
                duration: "Instantaneous",
                school: "Evocation",
                ritual: false,
                range: "150 feet",
                components: "V, S, M",
                classes: ["Wizard", "Sorcerer"],
                subclasses: "",
                text: "new",
                atHigherLevels: "more",
            },
        ];

        const result = upsertSpellsByNameSource(existing, incoming);

        expect(result.added).toBe(0);
        expect(result.updated).toBe(1);
        expect(result.spells).toHaveLength(1);
        expect(result.spells[0].id).toBe("fireball-xphb");
        expect(result.spells[0].classes).toEqual(["Wizard", "Sorcerer"]);
    });

    it("adds new spells when no match exists", () => {
        const existing: Spell[] = [];
        const incoming: Spell[] = [
            {
                id: "shield-xphb",
                name: "Shield",
                source: "XPHB",
                page: "275",
                level: 1,
                castingTime: "1 reaction",
                duration: "1 round",
                school: "Abjuration",
                ritual: false,
                range: "Self",
                components: "V, S",
                classes: ["Wizard"],
                subclasses: "",
                text: "A barrier of magical force appears...",
                atHigherLevels: "",
            },
        ];

        const result = upsertSpellsByNameSource(existing, incoming);

        expect(result.added).toBe(1);
        expect(result.updated).toBe(0);
        expect(result.spells).toHaveLength(1);
        expect(result.spells[0].id).toBe("shield-xphb");
    });
});
