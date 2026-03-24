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

test("shows save hint with save ability on spell assignment page", async ({ page }) => {
    const burningHands = {
        id: "burning-hands-phb",
        name: "Burning Hands",
        source: "PHB",
        page: "220",
        level: 1,
        castingTime: "1 action",
        duration: "Instantaneous",
        school: "Evocation",
        ritual: false,
        range: "Self",
        components: "V, S",
        classes: ["Wizard"],
        subclasses: "",
        text: "Each creature in a 15-foot cone must make a Dexterity saving throw.",
        atHigherLevels: "",
    };

    await seedLocalStorage(
        page,
        localStorageSeed({
            spells: [...testSpells, burningHands],
            characters: [seededCharacter],
        }),
    );

    await page.goto("/characters/char-wizard-1/spells");
    await page.getByRole("button", { name: /Burning Hands/ }).click();

    await expect(page.getByText("Save Hint: Dexterity save vs Spell Save DC 11")).toBeVisible();
    await expect(page.getByText("Based on Intelligence 10 (+0)")).toBeVisible();
});
