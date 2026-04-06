import type {ChangelogEntry} from "$lib/utils/changelog";

/**
 * In-app release notes. Keep entries sorted by `id` ascending (ISO date `YYYY-MM-DD`,
 * or `YYYY-MM-DD.2` for a second release the same day). Read state is stored as a list of
 * entry ids in localStorage (ids not in this list are pruned on load).
 */
export const CHANGELOG_ENTRIES: readonly ChangelogEntry[] = [
    {
        id: "2026-04-06",
        title: "Subclass filters, custom resources and a changelog",
        summary: "Quality of life improvements",
        details: [
            "Subclass filtering: spells can now be filtered not only by class but also by subclass.",
            "Custom resources: add named resources with current and maximum values like Ki, sorcery points, or homebrew counters.",
            "Changelog: updates will now be visible in this changelog.",
            "Spell save DC: added spell save DC on the character sheet and edit screen for spells that call for saves.",
            "Selection filter: character spell list now has a toggle “only show spells selected for this character” to hide everything you haven’t added to their book yet.",
        ],
    },
];
