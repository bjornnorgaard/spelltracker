import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { localStorageSeed } from "./fixtures/app-state";
import { seedLocalStorage } from "./helpers";

const productionBackupPath = resolve(process.cwd(), "tests", "fixtures", "production-backup-2026-03-23.json");

test("restores from production backup file and shows imported character names", async ({ page }) => {
    await seedLocalStorage(page, localStorageSeed({ spells: [], characters: [] }));
    await page.goto("/backup");

    await page.locator("input[type='file']").setInputFiles(productionBackupPath);
    await expect(page.getByText("Loaded file into the editor.")).toBeVisible();

    page.on("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Restore from Text" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Your Characters" })).toBeVisible();
    await expect(page.locator("a[href^=\"/characters/\"]").first()).toBeVisible();
});
