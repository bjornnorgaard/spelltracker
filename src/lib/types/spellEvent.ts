import type {Spell} from "$lib/types/spell";

export interface SpellEvent {
    timestamp: Date;
    text: string;
    spell: Spell;
}