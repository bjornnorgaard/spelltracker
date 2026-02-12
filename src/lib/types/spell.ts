export interface Spell {
    id: string; // url-safe lower(name + "-" + source)
    name: string;
    source: string;
    page: string;
    level: number; // 0 for cantrip, 1-9 for leveled spells
    castingTime: string;
    duration: string;
    school: string;
    range: string;
    components: string;
    classes: string[];
    subclasses: string;
    text: string;
    atHigherLevels: string;
}

export interface SpellCsvRow {
    name: string;
    source: string;
    page: string;
    level: string;
    castingTime: string;
    duration: string;
    school: string;
    range: string;
    components: string;
    classes: string;
    optionalVariantClasses: string;
    subclasses: string;
    text: string;
    atHigherLevels: string;
}

type _Entry = string | Record<string, unknown>;

type _SpellClassRef = {
    name: string;
    source?: string;
};

type _SpellSubclassRef = {
    class: _SpellClassRef;
    subclass: {
        name: string;
        shortName?: string;
        source?: string;
        subSubclass?: string;
    };
};

type _SpellClasses = {
    fromClassList?: _SpellClassRef[];
    fromClassListVariant?: _SpellClassRef[];
    fromSubclass?: _SpellSubclassRef[];
};

type _SpellTime = {
    number: number;
    unit: string;
    condition?: string;
};

type _SpellRange = {
    type: string;
    distance?: {
        type: string;
        amount?: number;
    };
};

type _SpellMaterialComponent = {
    text: string | true;
    consume?: boolean | string;
    cost?: number;
    [key: string]: unknown;
};

type _SpellComponents = {
    v?: boolean;
    s?: boolean;
    r?: boolean;
    m?: true | string | _SpellMaterialComponent;
    [key: string]: unknown;
};

type _SpellDuration = {
    type: string;
    concentration?: boolean;
    duration?: {
        type: string;
        amount?: number;
        upTo?: boolean;
    };
    ends?: string[];
    [key: string]: unknown;
};

type _SpellMeta = {
    ritual?: boolean;
    technomagic?: boolean;
    [key: string]: unknown;
};

type _Spell = {
    name: string;
    source: string;
    page?: number;
    level: number;
    school: string;
    subschools?: string[];
    time: _SpellTime[];
    range: _SpellRange;
    components: _SpellComponents;
    duration: _SpellDuration[];
    meta?: _SpellMeta;
    classes?: _SpellClasses;
    entries: _Entry[];
    entriesHigherLevel?: _Entry[];
    [key: string]: unknown;
};

export interface SpellDataFile {
    spell: _Spell[];
}

const _joinNonEmpty = (parts: (string | undefined | null)[], sep = ", "): string => {
    return parts
        .map(it => (it ?? "").trim())
        .filter(Boolean)
        .join(sep);
};

const _renderEntry = (entry: _Entry): string => {
    if (typeof entry === "string") return entry;
    return JSON.stringify(entry);
};

const _renderEntries = (entries: _Entry[] | undefined): string => {
    if (!entries?.length) return "";
    return entries.map(_renderEntry).join("\n\n");
};

const _renderLevel = (level: number): string => {
    if (level === 0) return "Cantrip";
    if (level === 1) return "1st";
    if (level === 2) return "2nd";
    if (level === 3) return "3rd";
    return `${level}th`;
};

const _renderSchool = (spell: _Spell): string => {
    return _joinNonEmpty([
        spell.school,
        spell.subschools?.length ? `(${spell.subschools.join(", ")})` : "",
        spell.meta?.ritual ? "(R)" : "",
        spell.meta?.technomagic ? "(T)" : "",
    ], " ").trim();
};

const _renderCastingTimePart = (time: _SpellTime): string => {
    return _joinNonEmpty([
        time.number != null ? `${time.number}` : "",
        time.unit,
        time.condition,
    ], " ");
};

const _renderCastingTime = (times: _SpellTime[]): string => {
    return (times || []).map(_renderCastingTimePart).filter(Boolean).join("; ");
};

const _renderRange = (range: _SpellRange): string => {
    if (!range) return "";

    const distanceType = range.distance?.type;
    const distanceAmount = range.distance?.amount;

    if (distanceType && distanceAmount != null) {
        return _joinNonEmpty([range.type, `${distanceAmount} ${distanceType}`], ": ");
    }

    if (distanceType) return _joinNonEmpty([range.type, distanceType], ": ");
    return range.type || "";
};

const _renderMaterial = (material: _SpellComponents["m"]): string => {
    if (material == null) return "";
    if (material === true) return "M";
    if (typeof material === "string") return `M (${material})`;

    const parts = [material.text === true ? "M" : `M (${material.text})`];
    if (material.consume != null) parts.push(`consumed=${String(material.consume)}`);
    if (material.cost != null) parts.push(`cost=${material.cost}cp`);
    return parts.join("; ");
};

const _renderComponents = (components: _SpellComponents | undefined): string => {
    if (!components) return "";

    return _joinNonEmpty([
        components.v ? "V" : "",
        components.s ? "S" : "",
        components.r ? "R" : "",
        _renderMaterial(components.m),
    ]);
};

const _renderDurationPart = (duration: _SpellDuration): string => {
    if (!duration) return "";

    if (duration.type === "instant") return "Instantaneous";

    if (duration.type === "timed") {
        const amount = duration.duration?.amount;
        const amountType = duration.duration?.type;
        const amountText = amount != null && amountType ? `${amount} ${amountType}` : amountType || "";
        const upToText = duration.duration?.upTo ? "up to " : "";
        const concText = duration.concentration ? "Concentration, " : "";
        return `${concText}${upToText}${amountText}`.trim();
    }

    if (duration.type === "permanent") {
        if (!duration.ends?.length) return "Permanent";
        return `Permanent (until ${duration.ends.join(" or ")})`;
    }

    if (duration.type === "special") return "Special";

    const genericDuration = duration.duration?.type
        ? _joinNonEmpty([
            duration.duration.amount != null ? `${duration.duration.amount}` : "",
            duration.duration.type,
        ], " ")
        : "";

    return _joinNonEmpty([
        duration.concentration ? "Concentration" : "",
        duration.type,
        genericDuration,
    ]);
};

const _renderDuration = (durations: _SpellDuration[]): string => {
    return (durations || []).map(_renderDurationPart).filter(Boolean).join("; ");
};

const _renderClassList = (classes: _SpellClasses | undefined, prop: "fromClassList" | "fromClassListVariant"): string => {
    const list = classes?.[prop] || [];
    return list
        .map(it => _joinNonEmpty([it.name, it.source ? `(${it.source})` : ""], " "))
        .filter(Boolean)
        .join(", ");
};

const _renderSubclasses = (subclasses: _SpellSubclassRef[] | undefined): string => {
    if (!subclasses?.length) return "";

    return subclasses
        .map(it => {
            const classPart = _joinNonEmpty([
                it.class.name,
                it.class.source ? `(${it.class.source})` : "",
            ], " ");

            const subclassPart = _joinNonEmpty([
                it.subclass.name,
                it.subclass.shortName && it.subclass.shortName !== it.subclass.name ? `[${it.subclass.shortName}]` : "",
                it.subclass.subSubclass ? `-${it.subclass.subSubclass}` : "",
                it.subclass.source ? `(${it.subclass.source})` : "",
            ], " ");

            return `${classPart}: ${subclassPart}`;
        })
        .join("; ");
};

const _spellToCsvRow = (spell: _Spell): SpellCsvRow => {
    return {
        name: spell.name ?? "",
        source: spell.source ?? "",
        page: spell.page == null ? "" : String(spell.page),
        level: _renderLevel(spell.level),
        castingTime: _renderCastingTime(spell.time || []),
        duration: _renderDuration(spell.duration || []),
        school: _renderSchool(spell),
        range: _renderRange(spell.range),
        components: _renderComponents(spell.components),
        classes: _renderClassList(spell.classes, "fromClassList"),
        optionalVariantClasses: _renderClassList(spell.classes, "fromClassListVariant"),
        subclasses: _renderSubclasses(spell.classes?.fromSubclass),
        text: _renderEntries(spell.entries),
        atHigherLevels: _renderEntries(spell.entriesHigherLevel),
    };
};

const _spellsToCsvRows = (spells: _Spell[]): SpellCsvRow[] => {
    return (spells || []).map(_spellToCsvRow);
};

const _spellDataFileToCsvRows = (dataFile: SpellDataFile): SpellCsvRow[] => {
    return _spellsToCsvRows(dataFile?.spell || []);
};

const _spellJsonToCsvRows = (jsonText: string): SpellCsvRow[] => {
    const parsed = JSON.parse(jsonText) as SpellDataFile;
    return _spellDataFileToCsvRows(parsed);
};

export const convertSpellCsvRows = (input: SpellDataFile | _Spell[] | string): SpellCsvRow[] => {
    if (typeof input === "string") return _spellJsonToCsvRows(input);
    if (Array.isArray(input)) return _spellsToCsvRows(input);
    return _spellDataFileToCsvRows(input);
};
