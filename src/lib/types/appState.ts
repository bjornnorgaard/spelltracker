import type {Spell} from "$lib/types/spell";
import type {Character} from "$lib/types/character";

export interface AppState {
    characters: Character[];
    spells: Spell[];
}