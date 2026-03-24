import { expect, test } from "@playwright/test";
import { localStorageSeed, seededCharacter, testSpells } from "./fixtures/app-state";
import { seedLocalStorage } from "./helpers";

test("manages selected, prepared, and always prepared spell states", async ({ page }) => {
    await seedLocalStorage(
        page,
        localStorageSeed({
            spells: testSpells,
            characters: [
                {
                    ...seededCharacter,
                    selectedSpellIds: [],
                    preparedSpellIds: [],
                    alwaysPreparedSpellIds: [],
                },
            ],
        }),
    );

    await page.goto("/characters/char-wizard-1/spells");
    await expect(page.getByText("Overview")).toBeVisible();

    await page.getByRole("button", { name: /Fire Bolt/ }).click();
    await page.getByRole("button", { name: /Prepare Fire Bolt/ }).click();

    await expect(page.getByText("Prepared 1/3")).toBeVisible();

    await page.getByRole("button", { name: /Detect Magic/ }).click();
    await page.getByRole("button", { name: /Mark as Always Prepared/ }).click();

    await expect(page.getByText("Always Prepared 1")).toBeVisible();
    await expect(page.getByText("Selected 2")).toBeVisible();
});
