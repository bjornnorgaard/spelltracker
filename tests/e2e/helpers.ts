import type { Page } from "@playwright/test";

export async function seedLocalStorage(
    page: Page,
    entries: Array<{ key: string; value: string }>,
) {
    await page.goto("/");
    await page.evaluate((seedEntries) => {
        localStorage.clear();
        for (const entry of seedEntries) {
            localStorage.setItem(entry.key, entry.value);
        }
    }, entries);
    await page.reload();
}
