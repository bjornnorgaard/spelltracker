import { LocalStorage } from '$lib/utils/storage.svelte';
import type { Character } from '$lib/types/character';

/**
 * Reactive store for managing characters
 */
class CharacterStore {
    #storage = new LocalStorage<Character[]>('spelltracker:characters', []);

    get characters(): Character[] {
        return this.#storage.current;
    }

    /**
     * Add a new character
     */
    addCharacter(characterData: Omit<Character, 'id'>): Character {
        const character: Character = {
            ...characterData,
            id: crypto.randomUUID()
        };
        this.#storage.current = [...this.characters, character];
        return character;
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
        this.#storage.current = this.characters.filter((c) => c.id !== id);
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
    }
}

export const characterStore = new CharacterStore();
