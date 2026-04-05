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

export function getPendingChangelogEntries(
    entries: readonly ChangelogEntry[],
    lastAcknowledgedId: string | null,
): ChangelogEntry[] {
    const sorted = sortChangelogEntriesById(entries);
    if (lastAcknowledgedId === null || lastAcknowledgedId === "") {
        return sorted;
    }
    return sorted.filter((e) => e.id.localeCompare(lastAcknowledgedId, undefined, {numeric: true}) > 0);
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
