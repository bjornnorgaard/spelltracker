import { LocalStorage } from '$lib/utils/storage.svelte';
import type { Character } from '$lib/types/character';

/**
 * Reactive store for managing characters
 */
class CharacterStore {
    #storage = new LocalStorage<Character[]>('spelltracker:characters', []);
    #activeIdStorage = new LocalStorage<string | null>('spelltracker:activeCharacterId', null);

    get characters(): Character[] {
        return this.#storage.current;
    }

    get activeCharacterId(): string | null {
        return this.#activeIdStorage.current;
    }

    set activeCharacterId(id: string | null) {
        this.#activeIdStorage.current = id;
    }

    get activeCharacter(): Character | undefined {
        const id = this.activeCharacterId;
        return id ? this.characters.find((c) => c.id === id) : undefined;
    }

    /**
     * Add a new character
     */
    addCharacter(character: Character): void {
        this.#storage.current = [...this.characters, character];

        // If this is the first character, make it active
        if (this.characters.length === 1) {
            this.activeCharacterId = character.id;
        }
    }

    /**
     * Update an existing character
     */
    updateCharacter(id: string, updates: Partial<Character>): void {
        this.#storage.current = this.characters.map((char) =>
            char.id === id ? { ...char, ...updates } : char
        );
    }

    /**
     * Delete a character
     */
    deleteCharacter(id: string): void {
        const wasActive = this.activeCharacterId === id;
        this.#storage.current = this.characters.filter((c) => c.id !== id);

        // If we deleted the active character, select another one
        if (wasActive) {
            const remaining = this.characters;
            this.activeCharacterId = remaining.length > 0 ? remaining[0].id : null;
        }
    }

    /**
     * Get character by ID
     */
    getCharacter(id: string): Character | undefined {
        return this.characters.find((c) => c.id === id);
    }

    /**
     * Clear all characters
     */
    clear(): void {
        this.#storage.current = [];
        this.activeCharacterId = null;
    }
}

export const characterStore = new CharacterStore();
