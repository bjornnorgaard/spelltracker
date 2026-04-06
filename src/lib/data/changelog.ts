import type {ChangelogEntry} from "$lib/utils/changelog";

/**
 * In-app release notes. Keep entries sorted by `id` ascending (ISO date `YYYY-MM-DD`,
 * or `YYYY-MM-DD.2` for a second release the same day). Read state is stored as a list of
 * entry ids in localStorage (ids not in this list are pruned on load).
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
