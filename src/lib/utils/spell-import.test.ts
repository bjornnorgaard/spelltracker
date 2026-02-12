import { describe, expect, it } from "vitest";

import {
    buildSpellFromCsvRow,
    createSourceEntries,
    normalizeClassName,
    parseSpellClasses,
    enrichSpellsWithLookupClasses,
    getSpellIndexUrlFromRepositoryUrl,
    getSpellSourceLookupUrl,
    selectAllSources,
    selectRecommendedSources,
    sourceFileToUrl,
    splitCommaValues,
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

        expect(spell.id).toBe("fireball|xphb");
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
                    time: [{ number: 1, unit: "action" }],
                    range: { type: "point", distance: { type: "self" } },
                    components: { v: true, s: true },
                    duration: [{ type: "timed", concentration: true, duration: { type: "minute", amount: 10 } }],
                    classes: {
                        fromClassList: [{ name: "Cleric", source: "PHB'24" }, { name: "Wizard", source: "PHB'24" }],
                    },
                    entries: ["For the duration, you sense the presence of magic."],
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
            id: "acid splash|phb",
            name: "Acid Splash",
            source: "PHB",
            page: "211",
            level: 0,
            castingTime: "1 action",
            duration: "Instantaneous",
            school: "Conjuration",
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
            id: "control flames|xge",
            name: "Control Flames",
            source: "XGE",
            page: "152",
            level: 0,
            castingTime: "1 action",
            duration: "Instantaneous",
            school: "Transmutation",
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
    it("updates existing spells and rewrites id to deterministic name|source", () => {
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
                id: "fireball|xphb",
                name: "Fireball",
                source: "XPHB",
                page: "241",
                level: 3,
                castingTime: "1 action",
                duration: "Instantaneous",
                school: "Evocation",
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
        expect(result.spells[0].id).toBe("fireball|xphb");
        expect(result.spells[0].classes).toEqual(["Wizard", "Sorcerer"]);
    });

    it("adds new spells when no match exists", () => {
        const existing: Spell[] = [];
        const incoming: Spell[] = [
            {
                id: "shield|xphb",
                name: "Shield",
                source: "XPHB",
                page: "275",
                level: 1,
                castingTime: "1 reaction",
                duration: "1 round",
                school: "Abjuration",
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
        expect(result.spells[0].id).toBe("shield|xphb");
    });
});
