import {describe, expect, it} from "vitest";
import type {ChangelogEntry} from "./changelog";
import {seedFirstVisitAndChangelogAck} from "./first-visit";

class MemoryStorage {
    #m = new Map<string, string>();
    getItem(key: string): string | null {
        return this.#m.get(key) ?? null;
    }
    setItem(key: string, value: string): void {
        this.#m.set(key, value);
    }
}

const shipped: ChangelogEntry[] = [
    {id: "2026-04-01", title: "A", summary: "a"},
    {id: "2026-04-03", title: "B", summary: "b"},
    {id: "2026-04-05", title: "C", summary: "c"},
];

describe("seedFirstVisitAndChangelogAck", () => {
    it("seeds first-visit and marks older shipped entries read for brand-new users", () => {
        const storage = new MemoryStorage();

        const {seededFirstVisit, seededChangelogAck} = seedFirstVisitAndChangelogAck({
            storage,
            firstVisitKey: "spelltracker:first-visit",
            changelogAckKey: "spelltracker:changelog-ack",
            nowIso: "2026-04-04T12:00:00.000Z",
            shippedEntries: shipped,
        });

        expect(seededFirstVisit).toBe(true);
        expect(seededChangelogAck).toBe(true);

        expect(storage.getItem("spelltracker:first-visit")).toBeTruthy();
        expect(JSON.parse(storage.getItem("spelltracker:changelog-ack")!)).toEqual({
            readEntryIds: ["2026-04-01", "2026-04-03"],
        });
    });

    it("does not overwrite an existing changelog-ack key", () => {
        const storage = new MemoryStorage();
        storage.setItem("spelltracker:changelog-ack", JSON.stringify({readEntryIds: ["2026-04-05"]}));

        const {seededFirstVisit, seededChangelogAck} = seedFirstVisitAndChangelogAck({
            storage,
            firstVisitKey: "spelltracker:first-visit",
            changelogAckKey: "spelltracker:changelog-ack",
            nowIso: "2026-04-04T12:00:00.000Z",
            shippedEntries: shipped,
        });

        expect(seededFirstVisit).toBe(true);
        expect(seededChangelogAck).toBe(false);
        expect(JSON.parse(storage.getItem("spelltracker:changelog-ack")!)).toEqual({
            readEntryIds: ["2026-04-05"],
        });
    });
});

