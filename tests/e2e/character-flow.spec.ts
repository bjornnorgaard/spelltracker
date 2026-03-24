import { expect, test } from "@playwright/test";
import { localStorageSeed, seededCharacter, testSpells } from "./fixtures/app-state";
import { seedLocalStorage } from "./helpers";

test("creates a character from home and lands on edit flow", async ({ page }) => {
    await seedLocalStorage(page, localStorageSeed({ spells: [], characters: [] }));
    await expect(page.getByText("No characters", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Create Character" }).click();

    await expect(page).toHaveURL(/\/characters\/.+\/edit$/);
    await expect(page.getByRole("heading", { name: "Character Info" })).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
});

test("tracks concentration and rest flow on character page", async ({ page }) => {
    const fogCloud = {
        id: "fog-cloud-phb",
        name: "Fog Cloud",
        source: "PHB",
        page: "3",
        level: 1,
        castingTime: "1 action",
        duration: "Concentration, up to 1 hour",
        school: "Conjuration",
        ritual: false,
        range: "120 feet",
        components: "V, S",
        classes: ["Wizard"],
        subclasses: "",
        text: "Create fog.",
        atHigherLevels: "",
    };

    await seedLocalStorage(
        page,
        localStorageSeed({
            spells: [...testSpells, fogCloud],
            characters: [
                {
                    ...seededCharacter,
                    selectedSpellIds: [...seededCharacter.selectedSpellIds, "fog-cloud-phb"],
                    preparedSpellIds: [...seededCharacter.preparedSpellIds, "fog-cloud-phb"],
                },
            ],
        }),
    );
    await page.goto("/characters/char-wizard-1");

    await expect(page.getByText("Spellbook")).toBeVisible();
    await page.getByText("Detect Magic", { exact: true }).first().click();
    await page.getByRole("button", { name: /Cast as/i }).first().click();

    await expect(page.getByRole("button", { name: "Drop Concentration" })).toBeVisible();

    await page.getByText("Fog Cloud", { exact: true }).first().click();
    await page.getByRole("button", { name: /Cast as/i }).first().click();

    await expect(page.getByText("Concentration Warning", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /Break Concentration & Cast|Cast Spell/ }).click();
    await expect(page.getByRole("button", { name: "Drop Concentration" })).toBeVisible();

    await page.getByRole("button", { name: "Long Rest" }).click();
    await expect(page.getByRole("button", { name: "Drop Concentration" })).toHaveCount(0);
});

test("shows spellcasting summary with spell save DC breakdown", async ({ page }) => {
    await seedLocalStorage(
        page,
        localStorageSeed({
            spells: testSpells,
            characters: [seededCharacter],
        }),
    );
    await page.goto("/characters/char-wizard-1");

    await expect(page.getByRole("heading", { name: "Spellcasting" })).toBeVisible();
    await expect(page.getByText("Spellcasting Ability: Intelligence")).toBeVisible();
    await expect(page.getByText("Spellcasting Ability Score: 10")).toBeVisible();
    await expect(page.getByText("Spell Save DC: 11")).toBeVisible();
    await expect(page.getByText("Breakdown: 8 + 3 + 0 = 11")).toBeVisible();
});

test("shows save hint for spells that require a saving throw", async ({ page }) => {
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
            characters: [
                {
                    ...seededCharacter,
                    selectedSpellIds: [...seededCharacter.selectedSpellIds, burningHands.id],
                    preparedSpellIds: [...seededCharacter.preparedSpellIds, burningHands.id],
                },
            ],
        }),
    );
    await page.goto("/characters/char-wizard-1");

    await page.getByText("Burning Hands", { exact: true }).first().click();
    await expect(page.getByText("Save Hint: Dexterity save vs DC 11")).toBeVisible();
    await expect(page.getByText("Based on Intelligence 10 (+0)")).toBeVisible();
});

test("free cast spell name opens referenced spell entry", async ({ page }) => {
    const detectMagicFreeCastCharacter = {
        ...seededCharacter,
        freePerLongRestSpells: [
            { spellId: "detect-magic-phb", total: 1, used: 0, why: "feature" },
        ],
    };

    await seedLocalStorage(
        page,
        localStorageSeed({
            spells: testSpells,
            characters: [detectMagicFreeCastCharacter],
        }),
    );
    await page.goto("/characters/char-wizard-1");

    await page.getByRole("button", { name: "Detect Magic" }).first().click();
    await expect(page.locator("#spell-item-detect-magic-phb")).toContainText("Detect Magic");
    await expect(page.getByText("School:", { exact: false })).toBeVisible();
});

test("can add and remove a custom resource in character edit", async ({ page }) => {
    await seedLocalStorage(
        page,
        localStorageSeed({
            spells: testSpells,
            characters: [seededCharacter],
        }),
    );
    await page.goto("/characters/char-wizard-1/edit");

    await expect(page.getByRole("heading", { name: "Custom Resources" })).toBeVisible();
    await page.getByRole("button", { name: "Add Custom Resource" }).click();
    await expect(page.getByRole("textbox", { name: "Name" }).last()).toHaveValue("New Resource");

    await page.getByRole("button", { name: "Remove Resource" }).click();
    await expect(page.getByText("No custom resources yet.")).toBeVisible();
});

test("sorcerer class auto-configures sorcery points from level", async ({ page }) => {
    await seedLocalStorage(
        page,
        localStorageSeed({
            spells: testSpells,
            characters: [seededCharacter],
        }),
    );
    await page.goto("/characters/char-wizard-1/edit");

    await page.getByLabel("Class").selectOption("Sorcerer");
    await page.getByLabel("Class").blur();
    await page.getByLabel("Level").fill("6");
    await page.getByLabel("Level").blur();

    await expect(page.getByRole("textbox", { name: "Name" }).nth(1)).toHaveValue("Sorcery Points");
    await expect(page.getByLabel("Max").first()).toHaveValue("6");
});
