export type ChangelogEntry = {
    /** Sortable release stamp: prefer ISO date `YYYY-MM-DD`, or `YYYY-MM-DD.N` for same-day releases. */
    id: string;
    title: string;
    /** Short line shown in lists / previews. */
    summary: string;
    /** Optional bullet points for the dialog body. */
    details?: string[];
};

/** Lexicographic order matches chronological order for ISO date ids. */
export function sortChangelogEntriesById(entries: readonly ChangelogEntry[]): ChangelogEntry[] {
    return [...entries].sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));
}

/** All shipped entry ids in sort order (for persisting “read” state). */
export function getShippedEntryIds(entries: readonly ChangelogEntry[]): string[] {
    return sortChangelogEntriesById(entries).map((e) => e.id);
}

export function getPendingChangelogEntries(
    entries: readonly ChangelogEntry[],
    readEntryIds: readonly string[],
): ChangelogEntry[] {
    const read = new Set(readEntryIds);
    return sortChangelogEntriesById(entries).filter((e) => !read.has(e.id));
}

/** Unread if this id is not in the user’s read list. */
export function isChangelogEntryUnread(entryId: string, readEntryIds: readonly string[]): boolean {
    return !readEntryIds.includes(entryId);
}

/** Mark one id read; returns a new array (deduped). */
export function withEntryMarkedRead(readEntryIds: readonly string[], entryId: string): string[] {
    if (readEntryIds.includes(entryId)) return [...readEntryIds];
    return [...readEntryIds, entryId];
}

/** Remove id from the read list (show as unread again). */
export function withEntryMarkedUnread(readEntryIds: readonly string[], entryId: string): string[] {
    if (!readEntryIds.includes(entryId)) return [...readEntryIds];
    return readEntryIds.filter((id) => id !== entryId);
}

/** Latest id in the shipped list — used when the user acknowledges all pending notes. */
export function getLatestChangelogId(entries: readonly ChangelogEntry[]): string | null {
    const sorted = sortChangelogEntriesById(entries);
    if (sorted.length === 0) return null;
    return sorted[sorted.length - 1].id;
}

/** Newest-first for archive / history pages. */
export function getChangelogEntriesNewestFirst(entries: readonly ChangelogEntry[]): ChangelogEntry[] {
    const sorted = sortChangelogEntriesById(entries);
    return [...sorted].reverse();
}
