import type {ChangelogEntry} from "$lib/utils/changelog";

export type ChangelogAckState = {
    /** Entry ids the user has marked as read (only ids still present in the shipped changelog are kept). */
    readEntryIds: string[];
};

export function legacyWaterlineToReadIds(
    lastAcknowledgedId: string,
    shippedEntries: readonly {id: string}[],
): string[] {
    return shippedEntries
        .filter((e) => e.id.localeCompare(lastAcknowledgedId, undefined, {numeric: true}) <= 0)
        .map((e) => e.id);
}

/**
 * Normalizes localStorage JSON for changelog read state. Supports legacy `{ lastAcknowledgedId }`.
 */
export function normalizeChangelogAckState(
    parsed: unknown,
    shippedEntries: readonly ChangelogEntry[],
): ChangelogAckState {
    const empty: ChangelogAckState = {readEntryIds: []};
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return empty;
    }
    const o = parsed as Record<string, unknown>;
    const shipped = new Set(shippedEntries.map((e) => e.id));

    if (Array.isArray(o.readEntryIds)) {
        const ids = [
            ...new Set(
                o.readEntryIds.filter((x): x is string => typeof x === "string" && x.length > 0),
            ),
        ];
        return {readEntryIds: ids.filter((id) => shipped.has(id))};
    }

    const last = o.lastAcknowledgedId;
    if (typeof last === "string" && last.length > 0) {
        return {readEntryIds: legacyWaterlineToReadIds(last, shippedEntries)};
    }

    return empty;
}
