import type { Spell, SpellCsvRow } from "$lib/types/spell";
import { parseSpellLevel } from "$lib/utils/spell-formatter";

export type SourceEntry = {
    source: string;
    fileName: string;
    url: string;
    selected: boolean;
};

export function sourceFileToUrl(fileName: string, indexUrl: string): string {
    try {
        return new URL(fileName, indexUrl).toString();
    } catch {
        return fileName;
    }
}

export function createSourceEntries(payload: unknown, indexUrl: string): SourceEntry[] {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("The index file must be a JSON object of source-to-file mappings.");
    }

    const entries = Object.entries(payload)
        .filter((item): item is [string, string] => typeof item[0] === "string" && typeof item[1] === "string")
        .map(([source, fileName]) => ({
            source,
            fileName,
            url: sourceFileToUrl(fileName, indexUrl),
            selected: true,
        }));

    if (!entries.length) {
        throw new Error("No source files were found in this index.");
    }

    return entries;
}

export function splitCommaValues(value: string): string[] {
    return value
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

export function normalizeClassName(value: string): string {
    return value.replace(/\s*\([^)]*\)\s*$/g, "").trim();
}

export function parseSpellClasses(classes: string, optionalVariantClasses: string): string[] {
    const allClassValues = [
        ...splitCommaValues(classes),
        ...splitCommaValues(optionalVariantClasses),
    ]
        .map(normalizeClassName)
        .filter((value) => value.length > 0);

    return [...new Set(allClassValues)];
}

export function buildSpellFromCsvRow(row: SpellCsvRow): Spell {
    return {
        id: `${row.name}|${row.source}`.toLowerCase(),
        name: row.name,
        source: row.source,
        page: row.page,
        level: parseSpellLevel(row.level),
        castingTime: row.castingTime,
        duration: row.duration,
        school: row.school,
        range: row.range,
        components: row.components,
        classes: parseSpellClasses(row.classes, row.optionalVariantClasses),
        subclasses: row.subclasses,
        text: row.text,
        atHigherLevels: row.atHigherLevels,
    };
}

export function upsertSpellsByNameSource(existingSpells: Spell[], incomingSpells: Spell[]): {
    spells: Spell[];
    added: number;
    updated: number;
} {
    const merged = [...existingSpells];
    let added = 0;
    let updated = 0;

    for (const incomingSpell of incomingSpells) {
        const existingIndex = merged.findIndex(
            (existingSpell) =>
                existingSpell.name === incomingSpell.name && existingSpell.source === incomingSpell.source,
        );

        if (existingIndex >= 0) {
            merged[existingIndex] = {
                ...merged[existingIndex],
                ...incomingSpell,
                id: incomingSpell.id,
            };
            updated += 1;
        } else {
            merged.push(incomingSpell);
            added += 1;
        }
    }

    return {
        spells: merged,
        added,
        updated,
    };
}

export function selectAllSources(entries: SourceEntry[], selected: boolean): SourceEntry[] {
    return entries.map((entry) => ({
        ...entry,
        selected,
    }));
}

export function selectRecommendedSources(entries: SourceEntry[]): SourceEntry[] {
    const recommended = new Set(["TCE", "XGE", "XPHB"]);

    return entries.map((entry) => ({
        ...entry,
        selected: recommended.has(entry.source.toUpperCase()),
    }));
}
