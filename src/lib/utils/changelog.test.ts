import {describe, expect, it} from "vitest";
import {
    type ChangelogEntry,
    getChangelogEntriesNewestFirst,
    getLatestChangelogId,
    getPendingChangelogEntries,
    getShippedEntryIds,
    isChangelogEntryUnread,
    withEntryMarkedRead,
    withEntryMarkedUnread,
} from "./changelog";

const sample: ChangelogEntry[] = [
    {id: "2026-04-01", title: "A", summary: "a"},
    {id: "2026-04-03", title: "B", summary: "b"},
    {id: "2026-04-05", title: "C", summary: "c"},
];

describe("getShippedEntryIds", () => {
    it("returns sorted ids", () => {
        expect(getShippedEntryIds(sample)).toEqual(["2026-04-01", "2026-04-03", "2026-04-05"]);
    });
});

describe("getPendingChangelogEntries", () => {
    it("returns all entries when nothing read", () => {
        expect(getPendingChangelogEntries(sample, [])).toHaveLength(3);
    });

    it("returns entries not in read set", () => {
        const pending = getPendingChangelogEntries(sample, ["2026-04-01", "2026-04-03"]);
        expect(pending.map((e) => e.id)).toEqual(["2026-04-05"]);
    });

    it("returns empty when all read", () => {
        expect(getPendingChangelogEntries(sample, getShippedEntryIds(sample))).toHaveLength(0);
    });

    it("sorts unsorted input by id", () => {
        const shuffled: ChangelogEntry[] = [
            {id: "2026-04-05", title: "C", summary: "c"},
            {id: "2026-04-01", title: "A", summary: "a"},
        ];
        const pending = getPendingChangelogEntries(shuffled, []);
        expect(pending.map((e) => e.id)).toEqual(["2026-04-01", "2026-04-05"]);
    });
});

describe("isChangelogEntryUnread", () => {
    it("is unread when id not in read list", () => {
        expect(isChangelogEntryUnread("2026-04-01", [])).toBe(true);
        expect(isChangelogEntryUnread("2026-04-05", ["2026-04-01", "2026-04-03"])).toBe(true);
    });

    it("is read when id is listed", () => {
        expect(isChangelogEntryUnread("2026-04-03", ["2026-04-03"])).toBe(false);
        expect(isChangelogEntryUnread("2026-04-01", ["2026-04-01", "2026-04-03"])).toBe(false);
    });
});

describe("withEntryMarkedRead", () => {
    it("adds id when missing", () => {
        expect(withEntryMarkedRead([], "a")).toEqual(["a"]);
        expect(withEntryMarkedRead(["a"], "b")).toEqual(["a", "b"]);
    });

    it("does not duplicate", () => {
        expect(withEntryMarkedRead(["a", "b"], "a")).toEqual(["a", "b"]);
    });
});

describe("withEntryMarkedUnread", () => {
    it("removes id when present", () => {
        expect(withEntryMarkedUnread(["a", "b", "c"], "b")).toEqual(["a", "c"]);
    });

    it("is a no-op when id not read", () => {
        expect(withEntryMarkedUnread(["a"], "b")).toEqual(["a"]);
    });
});

describe("getChangelogEntriesNewestFirst", () => {
    it("returns entries newest id first", () => {
        const ordered = getChangelogEntriesNewestFirst(sample);
        expect(ordered.map((e) => e.id)).toEqual(["2026-04-05", "2026-04-03", "2026-04-01"]);
    });
});

describe("getLatestChangelogId", () => {
    it("returns null for empty list", () => {
        expect(getLatestChangelogId([])).toBeNull();
    });

    it("returns max id", () => {
        expect(getLatestChangelogId(sample)).toBe("2026-04-05");
    });
});
