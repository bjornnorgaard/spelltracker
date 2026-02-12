import type { Spell, SpellCsvRow } from "$lib/types/spell";
import { parseSpellLevel } from "$lib/utils/spell-formatter";

export type SourceEntry = {
    source: string;
    fileName: string;
    url: string;
    selected: boolean;
};

export type SpellSourceLookup = Record<string, Record<string, unknown>>;

const SPELL_SOURCE_LOOKUP_PATH = "/data/generated/gendata-spell-source-lookup.json";

export function sourceFileToUrl(fileName: string, indexUrl: string): string {
    try {
        return new URL(fileName, indexUrl).toString();
    } catch {
        return fileName;
    }
}

export function getSpellSourceLookupUrl(indexUrl: string): string {
    try {
        const parsed = new URL(indexUrl);

        if (parsed.pathname.endsWith("/data/spells/index.json")) {
            parsed.pathname = parsed.pathname.replace(
                /\/data\/spells\/index\.json$/,
                SPELL_SOURCE_LOOKUP_PATH,
            );
            parsed.search = "";
            parsed.hash = "";
            return parsed.toString();
        }

        return new URL("../generated/gendata-spell-source-lookup.json", parsed).toString();
    } catch {
        return SPELL_SOURCE_LOOKUP_PATH;
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

function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .map((part) => (typeof part === "string" ? part : String(part ?? "")))
            .map((part) => part.trim())
            .filter((part) => part.length > 0);
    }

    if (typeof value === "string") {
        return splitCommaValues(value);
    }

    return [];
}

export function normalizeClassName(value: string): string {
    return value.replace(/\s*\([^)]*\)\s*$/g, "").trim();
}

function parseClassesFromSubclasses(subclasses: unknown): string[] {
    if (typeof subclasses !== "string" || !subclasses.trim()) {
        return [];
    }

    return subclasses
        .split(";")
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map((part) => part.split(":")[0]?.trim() ?? "")
        .map(normalizeClassName)
        .filter((part) => part.length > 0);
}

export function parseSpellClasses(
    classes: unknown,
    optionalVariantClasses: unknown,
    subclasses?: unknown,
): string[] {
    const allClassValues = [
        ...toStringArray(classes),
        ...toStringArray(optionalVariantClasses),
        ...parseClassesFromSubclasses(subclasses),
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
        classes: parseSpellClasses(row.classes, row.optionalVariantClasses, row.subclasses),
        subclasses: row.subclasses,
        text: row.text,
        atHigherLevels: row.atHigherLevels,
    };
}

function getClassesFromLookup(lookup: SpellSourceLookup, spellSource: string, spellName: string): string[] {
    const sourceKey = spellSource.toLowerCase();
    const spellKey = spellName.toLowerCase();

    const sourceLookup = lookup[sourceKey];
    if (!sourceLookup || typeof sourceLookup !== "object") {
        return [];
    }

    const lookupEntry = sourceLookup[spellKey] as Record<string, unknown> | undefined;
    if (!lookupEntry || typeof lookupEntry !== "object") {
        return [];
    }

    const classNames = new Set<string>();

    const classTrees = [
        lookupEntry.class as Record<string, unknown> | undefined,
        lookupEntry.classVariant as Record<string, unknown> | undefined,
    ];

    for (const classTree of classTrees) {
        if (!classTree || typeof classTree !== "object") continue;

        for (const sourceVersionMap of Object.values(classTree)) {
            if (!sourceVersionMap || typeof sourceVersionMap !== "object") continue;

            for (const [className, enabled] of Object.entries(sourceVersionMap as Record<string, unknown>)) {
                if (!enabled) continue;
                const normalized = normalizeClassName(className);
                if (normalized) classNames.add(normalized);
            }
        }
    }

    return [...classNames];
}

export function enrichSpellWithLookupClasses(spell: Spell, lookup: SpellSourceLookup): Spell {
    const lookupClasses = getClassesFromLookup(lookup, spell.source, spell.name);
    if (!lookupClasses.length) {
        return spell;
    }

    return {
        ...spell,
        classes: [...new Set([...lookupClasses, ...(spell.classes ?? [])].map(normalizeClassName).filter(Boolean))],
    };
}

export function enrichSpellsWithLookupClasses(spellList: Spell[], lookup: SpellSourceLookup): Spell[] {
    return spellList.map((spell) => enrichSpellWithLookupClasses(spell, lookup));
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
