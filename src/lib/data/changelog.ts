import type {ChangelogEntry} from "$lib/utils/changelog";

/**
 * In-app release notes. Keep entries sorted by `id` ascending (ISO date `YYYY-MM-DD`,
 * or `YYYY-MM-DD.2` for a second release the same day). Read state is stored as a list of
 * entry ids in localStorage (ids not in this list are pruned on load).
 */
export const CHANGELOG_ENTRIES: readonly ChangelogEntry[] = [
    {
        id: "2026-03-01",
        title: "What Spelltracker does",
        summary:
            "A local, browser-only D&D 5e spell helper: import a spell library, build characters, and run encounters from your spellbook.",
        details: [
            "Characters: create multiple characters with class, level, spellcasting ability and score, and spell slots you can tick as you use them.",
            "Spellbook: pick which spells each character knows (selected spells), mark prepared and always-prepared spells, track concentration, and add per-spell notes.",
            "Limited-use spells: configure free casts per long or short rest (e.g. certain domain or patron spells) and reset them on rest.",
            "Play view: filter your character’s spells by level, casting time, ritual, and concentration; use long rest and short rest to recharge slots and uses.",
            "Spell save DC: shown from your proficiency, level, and spellcasting ability—used with saving-throw spells so you see the right DC at a glance.",
            "Spells library: browse and search the full imported list by level, class, school, and source; spot data issues with validation hints.",
            "Import: pull spells from a configurable GitHub-style spell index (5e tools JSON) and optional CSV; merge imports and enrich classes and subclasses from the lookup when available.",
            "Backup & settings: export and import your spells and characters as JSON; advanced JSON editing and reset live under Settings.",
            "Concentration: warns you before replacing an active concentration spell when you cast another.",
            "Everything stays on your device in local storage—no account required.",
        ],
    },
    {
        id: "2026-04-06",
        title: "Subclass filters, changelog, custom resources, and spellbook polish",
        summary:
            "Filter spells by subclass on the character spell list, read release notes in-app, track custom resources, and narrow the list to spells you’ve selected for that character.",
        details: [
            "Subclass filtering: with a class chosen on the character spell list, optional subclass chips filter which spells appear—great when your list is enriched from the spell lookup after import.",
            "Changelog: unread updates show as a notice in the layout (hidden while you’re on the Changelog page); open Changelog in the footer for full history, mark entries read or unread, or mark all read.",
            "Custom resources: on character edit, add named pools with current and maximum values (think Ki, sorcery points, or homebrew counters)—some classes get sensible defaults when you pick them.",
            "Spell save DC: spellcasting ability, score, and level feed a clear spell save DC on the character sheet and edit screen for spells that call for saves.",
            "Selection filter: on the character spell list, toggle “only show spells selected for this character” to hide everything you haven’t added to their book yet.",
        ],
    },
];
