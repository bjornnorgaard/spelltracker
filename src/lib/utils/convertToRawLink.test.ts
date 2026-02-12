import { describe, expect, it } from "vitest";

import { convertToRawLink } from "$lib/utils/convertToRawLink";

describe("convertToRawLink", () => {
    it("converts a GitHub blob URL to the raw URL", () => {
        const input =
            "https://github.com/5etools-mirror-3/5etools-src/blob/main/data/spells/index.json";
        const expected =
            "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/spells/index.json";

        expect(convertToRawLink(input)).toBe(expected);
    });

    it("leaves non-GitHub URLs unchanged", () => {
        const input = "https://example.com/data/spells/index.json";

        expect(convertToRawLink(input)).toBe(input);
    });

    it("leaves raw GitHub URLs unchanged", () => {
        const input =
            "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/spells/index.json";

        expect(convertToRawLink(input)).toBe(input);
    });
});
