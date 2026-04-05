import {describe, expect, it} from "vitest";
import {
    type ChangelogEntry,
    getChangelogEntriesNewestFirst,
    getLatestChangelogId,
    getPendingChangelogEntries,
} from "./changelog";

const sample: ChangelogEntry[] = [
    {id: "2026-04-01", title: "A", summary: "a"},
    {id: "2026-04-03", title: "B", summary: "b"},
    {id: "2026-04-05", title: "C", summary: "c"},
];

describe("getPendingChangelogEntries", () => {
    it("returns all entries when nothing acknowledged", () => {
        expect(getPendingChangelogEntries(sample, null)).toHaveLength(3);
        expect(getPendingChangelogEntries(sample, "")).toHaveLength(3);
    });

    it("returns entries strictly after last acknowledged id", () => {
        const pending = getPendingChangelogEntries(sample, "2026-04-03");
        expect(pending.map((e) => e.id)).toEqual(["2026-04-05"]);
    });

    it("returns empty when caught up", () => {
        expect(getPendingChangelogEntries(sample, "2026-04-05")).toHaveLength(0);
        expect(getPendingChangelogEntries(sample, "2099-12-31")).toHaveLength(0);
    });

    it("sorts unsorted input by id", () => {
        const shuffled: ChangelogEntry[] = [
            {id: "2026-04-05", title: "C", summary: "c"},
            {id: "2026-04-01", title: "A", summary: "a"},
        ];
        const pending = getPendingChangelogEntries(shuffled, null);
        expect(pending.map((e) => e.id)).toEqual(["2026-04-01", "2026-04-05"]);
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
