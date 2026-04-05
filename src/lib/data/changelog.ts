import type {ChangelogEntry} from "$lib/utils/changelog";

/**
 * In-app release notes. Keep entries sorted by `id` ascending (ISO date `YYYY-MM-DD`,
 * or `YYYY-MM-DD.2` for a second release the same day). Only the latest id is stored
 * client-side after the user acknowledges — not the full text history.
 */
export const CHANGELOG_ENTRIES: readonly ChangelogEntry[] = [
    {
        id: "2026-04-12",
        title: "Subclass filter!",
        summary: "We now have subclass filtering",
        details: [
            "You can now filter spells by subclass.",
            "Go to the character edit spells to try it.",
        ],
    },
    {
        id: "2026-04-06",
        title: "What's new",
        summary: "In-app release notes and acknowledgements.",
        details: [
            "A notice appears in the layout when there are updates you have not marked as read yet.",
            "The full history lives on the Changelog page; we only store the last release you acknowledged in this browser.",
        ],
    },
];
