# Requested Features Backlog

This document tracks requested features that need to be prioritized and analyzed for dependencies before implementation.

## Features to Prioritize

1. **Display character spell save DC**
   - Show each character's spell save difficulty class in the UI.
   - Use this value when displaying spells that require a saving throw.
   - Include an info message that explains how spell save DC is calculated so users can verify the number.

2. **Show relevant character stat for save-based spells**
   - When a spell requires a save, also display the character's relevant casting stat (for example, spellcasting ability modifier).
   - Goal: reduce friction by making required numbers visible in one place.

3. **Improve free-cast link navigation**
   - Update free-cast references so users can click and jump directly to the referenced spell.
   - Acceptable behavior can be either:
     - in-page scroll to the spell entry, or
     - redirect/navigation to the correct spell location.
     - inline expansion of the referenced spell details so users can view it without leaving their current spot.

4. **Support custom class abilities/resources**
   - Add support for tracking class-specific custom abilities and resource pools per character.
   - Examples:
     - Sorcerer: sorcery points (typically tied to level)
     - Paladin/Cleric-style resource examples: channel divinity
     - Other class-specific tracked resources as needed

5. **Spell component inventory quick-view**
   - Add a way for component-using classes to quickly view what spell components they have in their bag/inventory.
   - Focus on lightweight inventory management specifically for spell components.
   - Track component usage by count, gold value, and any other relevant consumption method used by spells.

6. **Capture character spellcasting ability input**
   - Add a per-character input for spellcasting ability (for example: INT/WIS/CHA).
   - Use this input as part of spell save DC calculation logic.
   - Keep this aligned with the spell save DC display feature so both values stay consistent.

## Next Step (Planning)

For each feature above, we should document:
- Priority (high/medium/low)
- Required data model/store changes
- UI surfaces affected
- Routing/navigation implications (if any)
- Dependencies and implementation order
