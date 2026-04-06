import type {ChangelogEntry} from "$lib/utils/changelog";
import type {ChangelogAckState} from "$lib/utils/changelog-ack";

export type FirstVisitState = {
    /** ISO timestamp when the app was first visited in this browser. */
    at: string;
    /**
     * Changelog ids strictly older than this are auto-marked read for brand new users.
     * Stored as `YYYY-MM-DD` (UTC day from `toISOString()`).
     */
    changelogCutoffId: string;
};

export type StorageLike = {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
};

export function getUtcDayIdFromIso(iso: string): string {
    return iso.slice(0, 10);
}

export function getAutoReadEntryIdsForNewUser(
    entries: readonly ChangelogEntry[],
    cutoffId: string,
): string[] {
    return entries
        .filter((e) => e.id.localeCompare(cutoffId, undefined, {numeric: true}) < 0)
        .map((e) => e.id);
}

export function seedFirstVisitAndChangelogAck(params: {
    storage: StorageLike;
    firstVisitKey: string;
    changelogAckKey: string;
    nowIso: string;
    shippedEntries: readonly ChangelogEntry[];
}): {seededFirstVisit: boolean; seededChangelogAck: boolean} {
    const {storage, firstVisitKey, changelogAckKey, nowIso, shippedEntries} = params;

    const hadAckKey = storage.getItem(changelogAckKey) !== null;
    const hasFirstVisit = storage.getItem(firstVisitKey) !== null;

    const cutoffId = getUtcDayIdFromIso(nowIso);

    let seededFirstVisit = false;
    let seededChangelogAck = false;

    if (!hasFirstVisit) {
        const firstVisit: FirstVisitState = {at: nowIso, changelogCutoffId: cutoffId};
        storage.setItem(firstVisitKey, JSON.stringify(firstVisit));
        seededFirstVisit = true;
    }

    if (!hadAckKey) {
        const seeded: ChangelogAckState = {
            readEntryIds: getAutoReadEntryIdsForNewUser(shippedEntries, cutoffId),
        };
        storage.setItem(changelogAckKey, JSON.stringify(seeded));
        seededChangelogAck = true;
    }

    return {seededFirstVisit, seededChangelogAck};
}

