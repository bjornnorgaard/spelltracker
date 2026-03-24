import { expect, test } from "@playwright/test";
import { localStorageSeed } from "./fixtures/app-state";
import { seedLocalStorage } from "./helpers";

test("imports spells from repository index and displays them in browser", async ({ page }) => {
    await seedLocalStorage(page, localStorageSeed({ spells: [], characters: [] }));

    await page.route("**/data/spells/index.json", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                PHB: "spells-phb.json",
            }),
        });
    });

    await page.route("**/data/generated/gendata-spell-source-lookup.json", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                phb: {
                    "fire bolt": {
                        class: {
                            PHB: { Wizard: true },
                        },
                    },
                },
            }),
        });
    });

    await page.route("**/data/spells/spells-phb.json", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                spell: [
                    {
                        name: "Fire Bolt",
                        source: "PHB",
                        page: 211,
                        level: 0,
                        school: "V",
                        time: [{ number: 1, unit: "action" }],
                        range: { type: "point", distance: { type: "feet", amount: 120 } },
                        components: { v: true, s: true },
                        duration: [{ type: "instant" }],
                        entries: ["You hurl a mote of fire at a creature."],
                    },
                ],
            }),
        });
    });

    await page.goto("/spells/import");
    await page.getByLabel("Repository").fill("owner/repo");
    await page.getByRole("button", { name: "Load Sources" }).click();
    await expect(page.getByText("1 sources found, 1 selected.")).toBeVisible();

    await page.getByRole("button", { name: "Import Selected Sources" }).click();
    await expect(page.getByText(/Imported 1 source files/)).toBeVisible();

    await page.goto("/spells");
    await expect(page.getByText("Total: 1")).toBeVisible();
    await expect(page.getByText("Fire Bolt", { exact: true })).toBeVisible();
});
