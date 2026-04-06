import {LocalStorage} from "$lib/utils/storage.svelte";
import {CHANGELOG_ENTRIES} from "$lib/data/changelog";
import {normalizeChangelogAckState, type ChangelogAckState} from "$lib/utils/changelog-ack";
import {seedFirstVisitAndChangelogAck} from "$lib/utils/first-visit";
import type {Spell} from "$lib/types/spell";
import type {Character} from "$lib/types/character";

const prefix = "spelltracker";

export type {ChangelogAckState};

const CHANGELOG_ACK_KEY = `${prefix}:changelog-ack`;
const FIRST_VISIT_KEY = `${prefix}:first-visit`;

const DEFAULT_CHANGELOG_ACK: ChangelogAckState = {
    readEntryIds: [],
};

/**
 * New user experience: avoid showing the entire historical changelog as unread.
 * If `changelog-ack` has never been written, we seed it by marking all shipped entries
 * older than the user's first-visit cutoff as read.
 *
 * Important: this only runs when the ack key is missing, so it won't override existing users'
 * explicit read/unread choices.
 */
function ensureFirstVisitAndSeedChangelogAck() {
    if (typeof localStorage === "undefined") return;
    seedFirstVisitAndChangelogAck({
        storage: localStorage,
        firstVisitKey: FIRST_VISIT_KEY,
        changelogAckKey: CHANGELOG_ACK_KEY,
        nowIso: new Date().toISOString(),
        shippedEntries: CHANGELOG_ENTRIES,
    });
}

function normalizeChangelogAck(parsed: unknown): ChangelogAckState {
    return normalizeChangelogAckState(parsed, CHANGELOG_ENTRIES);
}

function migrateChangelogAckLocalStorageKey() {
    if (typeof localStorage === "undefined") return;

    const raw = localStorage.getItem(CHANGELOG_ACK_KEY);
    if (raw === null) return;

    try {
        const parsed = JSON.parse(raw) as unknown;
        const normalized = normalizeChangelogAck(parsed);
        if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
            localStorage.setItem(CHANGELOG_ACK_KEY, JSON.stringify(normalized));
        }
    } catch {
        localStorage.setItem(CHANGELOG_ACK_KEY, JSON.stringify(DEFAULT_CHANGELOG_ACK));
    }
}

migrateChangelogAckLocalStorageKey();
ensureFirstVisitAndSeedChangelogAck();

export type SpellImportSettings = {
    repositoryUrl: string;
};

const SPELL_IMPORT_KEY = `${prefix}:spell-import`;

const DEFAULT_SPELL_IMPORT: SpellImportSettings = {
    repositoryUrl: "",
};

/** Coerce unknown / partial stored JSON into a valid shape (existing users may have no key yet, or legacy/partial data). */
function normalizeSpellImportParsed(parsed: unknown): SpellImportSettings {
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const u = (parsed as Record<string, unknown>).repositoryUrl;
        return {
            repositoryUrl: typeof u === "string" ? u : "",
        };
    }
    return {...DEFAULT_SPELL_IMPORT};
}

/**
 * Run before `spellImportSettings` is constructed so the first read never sees invalid JSON
 * (e.g. corrupted manual edits) and partial objects are upgraded to include `repositoryUrl`.
 */
function migrateSpellImportLocalStorageKey() {
    if (typeof localStorage === "undefined") return;

    const raw = localStorage.getItem(SPELL_IMPORT_KEY);
    if (raw === null) return;

    try {
        const parsed = JSON.parse(raw) as unknown;
        const normalized = normalizeSpellImportParsed(parsed);
        if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
            localStorage.setItem(SPELL_IMPORT_KEY, JSON.stringify(normalized));
        }
    } catch {
        localStorage.setItem(SPELL_IMPORT_KEY, JSON.stringify(DEFAULT_SPELL_IMPORT));
    }
}

migrateSpellImportLocalStorageKey();

export const spells = new LocalStorage<Spell[]>(prefix + ":spells", []);
export const characters = new LocalStorage<Character[]>(prefix + ":characters", []);
export const spellImportSettings = new LocalStorage<SpellImportSettings>(SPELL_IMPORT_KEY, DEFAULT_SPELL_IMPORT);
export const changelogAck = new LocalStorage<ChangelogAckState>(CHANGELOG_ACK_KEY, DEFAULT_CHANGELOG_ACK);

/** Safe read for UI: `LocalStorage` can yield `null` if the key stored invalid JSON (e.g. literal `null`). */
export function getChangelogAck(): ChangelogAckState {
    return normalizeChangelogAck(changelogAck.current as unknown);
}

/** Safe read for UI: works if stored value is missing or malformed before migration runs. */
export function getSpellImportRepositoryUrl(): string {
    return normalizeSpellImportParsed(spellImportSettings.current as unknown).repositoryUrl;
}
