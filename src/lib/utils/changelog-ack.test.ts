import {describe, expect, it} from "vitest";
import type {ChangelogEntry} from "./changelog";
import {legacyWaterlineToReadIds, normalizeChangelogAckState} from "./changelog-ack";

const shipped: ChangelogEntry[] = [
    {id: "2026-04-01", title: "A", summary: "a"},
    {id: "2026-04-03", title: "B", summary: "b"},
    {id: "2026-04-05", title: "C", summary: "c"},
];

describe("legacyWaterlineToReadIds", () => {
    it("includes all ids up to and including the waterline", () => {
        expect(legacyWaterlineToReadIds("2026-04-03", shipped)).toEqual(["2026-04-01", "2026-04-03"]);
    });

    it("includes none when waterline is before the first entry", () => {
        expect(legacyWaterlineToReadIds("2025-12-31", shipped)).toEqual([]);
    });

    it("includes all when waterline is at or after the latest", () => {
        expect(legacyWaterlineToReadIds("2026-04-05", shipped)).toEqual([
            "2026-04-01",
            "2026-04-03",
            "2026-04-05",
        ]);
        expect(legacyWaterlineToReadIds("2099-01-01", shipped)).toEqual([
            "2026-04-01",
            "2026-04-03",
            "2026-04-05",
        ]);
    });
});

describe("normalizeChangelogAckState", () => {
    it("returns empty read list for null / invalid / array input", () => {
        expect(normalizeChangelogAckState(null, shipped)).toEqual({readEntryIds: []});
        expect(normalizeChangelogAckState(undefined, shipped)).toEqual({readEntryIds: []});
        expect(normalizeChangelogAckState([], shipped)).toEqual({readEntryIds: []});
        expect(normalizeChangelogAckState("x", shipped)).toEqual({readEntryIds: []});
    });

    it("parses readEntryIds dedupes and drops unknown ids", () => {
        expect(
            normalizeChangelogAckState(
                {readEntryIds: ["2026-04-03", "2026-04-03", "gone", ""]},
                shipped,
            ),
        ).toEqual({readEntryIds: ["2026-04-03"]});
    });

    it("migrates legacy lastAcknowledgedId to readEntryIds", () => {
        expect(normalizeChangelogAckState({lastAcknowledgedId: "2026-04-03"}, shipped)).toEqual({
            readEntryIds: ["2026-04-01", "2026-04-03"],
        });
    });

    it("ignores empty lastAcknowledgedId string", () => {
        expect(normalizeChangelogAckState({lastAcknowledgedId: ""}, shipped)).toEqual({readEntryIds: []});
    });

    it("prefers readEntryIds over legacy when both present", () => {
        expect(
            normalizeChangelogAckState(
                {readEntryIds: ["2026-04-05"], lastAcknowledgedId: "2026-04-01"},
                shipped,
            ),
        ).toEqual({readEntryIds: ["2026-04-05"]});
    });
});
