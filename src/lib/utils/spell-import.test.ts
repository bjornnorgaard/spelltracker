import { describe, expect, it } from "vitest";

import {
    buildSpellFromCsvRow,
    createSourceEntries,
    selectAllSources,
    selectRecommendedSources,
    sourceFileToUrl,
    splitCommaValues,
    type SourceEntry,
} from "$lib/utils/spell-import";

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
