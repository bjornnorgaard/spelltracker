import type { Character } from './character';
import type { Spell } from './spell';

/**
 * Filter criteria for spell browsing. We only support level filtering for  now.
 */
export interface SpellFilters {
    level: number[];
}

/**
 * Application state for filters and UI
 */
export interface AppState {
    characters: Character[];
    activeCharacterId: string | null;
    spells: Spell[];
    filters: SpellFilters;
    searchQuery: string;
}
