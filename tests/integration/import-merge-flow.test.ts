import { describe, expect, it } from "vitest";
import { convertSpellCsvRows } from "$lib/types/spell";
import { buildSpellFromCsvRow, upsertSpellsByNameSource } from "$lib/utils/spell-import";

describe("import merge integration", () => {
    it("converts json payload rows and merges updates by name+source", () => {
        const existing = [
            {
                id: "fire-bolt-phb",
                name: "Fire Bolt",
                source: "PHB",
                page: "211",
                level: 0,
                castingTime: "1 action",
                duration: "Instantaneous",
                school: "Evocation",
                ritual: false,
                range: "120 feet",
                components: "V, S",
                classes: ["Wizard"],
                subclasses: "",
                text: "old text",
                atHigherLevels: "",
            },
        ];

        const payload = JSON.stringify({
            spell: [
                {
                    name: "Fire Bolt",
                    source: "PHB",
                    page: 211,
                    level: 0,
                    school: "V",
                    time: [{ number: 1, unit: "action" }],
                    range: { type: "point", distance: { type: "feet", amount: 120 } },
                    components: { v: true, s: true },
                    duration: [{ type: "instant" }],
                    entries: ["new text"],
                },
            ],
        });

        const incoming = convertSpellCsvRows(payload).map(buildSpellFromCsvRow);
        const merged = upsertSpellsByNameSource(existing, incoming);

        expect(merged.added).toBe(0);
        expect(merged.updated).toBe(1);
        expect(merged.spells).toHaveLength(1);
        expect(merged.spells[0].text).toContain("new text");
        expect(merged.spells[0].id).toBe("fire-bolt-phb");
    });
});
