import type { Spell } from "$lib/types/spell";

export const SAVE_ABILITIES = [
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma",
] as const;

export type SaveAbility = (typeof SAVE_ABILITIES)[number];

export function getSavingThrowAbility(spell: Pick<Spell, "text" | "atHigherLevels">): SaveAbility | null {
    const haystack = `${spell.text ?? ""} ${spell.atHigherLevels ?? ""}`;
    const match = haystack.match(
        /\b(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+saving throw\b/i
    );
    if (!match) return null;

    const normalized = match[1].toLowerCase();
    return SAVE_ABILITIES.find((ability) => ability.toLowerCase() === normalized) ?? null;
}

export function spellRequiresSavingThrow(spell: Pick<Spell, "text" | "atHigherLevels">): boolean {
    return /\bsaving throw\b/i.test(`${spell.text ?? ""} ${spell.atHigherLevels ?? ""}`);
}
