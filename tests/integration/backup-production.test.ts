import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type BackupPayload = {
    spells: Array<{
        id: string;
        name: string;
        source: string;
        level: number;
    }>;
    characters: Array<{
        id: string;
        name: string;
        selectedSpellIds?: string[];
    }>;
};

describe("production backup fixture", () => {
    it("parses and contains spell + character collections", () => {
        const filePath = resolve(process.cwd(), "tests", "fixtures", "production-backup-2026-03-23.json");
        const parsed = JSON.parse(readFileSync(filePath, "utf-8")) as BackupPayload;

        expect(Array.isArray(parsed.spells)).toBe(true);
        expect(Array.isArray(parsed.characters)).toBe(true);
        expect(parsed.spells.length).toBeGreaterThan(100);
        expect(parsed.characters.length).toBeGreaterThan(0);
    });

    it("contains spell entries compatible with app requirements", () => {
        const filePath = resolve(process.cwd(), "tests", "fixtures", "production-backup-2026-03-23.json");
        const parsed = JSON.parse(readFileSync(filePath, "utf-8")) as BackupPayload;

        const sample = parsed.spells[0];
        expect(sample.id).toBeTruthy();
        expect(sample.name).toBeTruthy();
        expect(sample.source).toBeTruthy();
        expect(typeof sample.level).toBe("number");
    });
});
