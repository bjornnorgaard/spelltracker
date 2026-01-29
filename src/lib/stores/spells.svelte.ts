import { LocalStorage } from '$lib/utils/storage.svelte';
import type { Spell } from '$lib/types/spell';

/**
 * Reactive store for managing spells
 */
class SpellStore {
    #storage = new LocalStorage<Spell[]>('spelltracker:spells', []);

    get spells(): Spell[] {
        return this.#storage.current;
    }

    /**
     * Add a single spell
     */
    addSpell(spell: Spell): void {
        // Check for duplicates by name
        if (this.spells.some((s) => s.name === spell.name)) {
            console.warn(`Spell "${spell.name}" already exists`);
            return;
        }
        this.#storage.current = [...this.spells, spell];
    }

    /**
     * Add multiple spells
     */
    addSpells(spells: Spell[]): void {
        const existingNames = new Set(this.spells.map((s) => s.name));
        const newSpells = spells.filter((s) => !existingNames.has(s.name));

        if (newSpells.length > 0) {
            this.#storage.current = [...this.spells, ...newSpells];
        }
    }

    /**
     * Update an existing spell
     */
    updateSpell(id: string, updates: Partial<Spell>): void {
        this.#storage.current = this.spells.map((spell) =>
            spell.id === id ? { ...spell, ...updates } : spell
        );
    }

    /**
     * Delete a spell
     */
    deleteSpell(id: string): void {
        this.#storage.current = this.spells.filter((s) => s.id !== id);
    }

    /**
     * Get spell by ID
     */
    getSpell(id: string): Spell | undefined {
        return this.spells.find((s) => s.id === id);
    }

    /**
     * Get spell by name
     */
    getSpellByName(name: string): Spell | undefined {
        return this.spells.find((s) => s.name.toLowerCase() === name.toLowerCase());
    }

    /**
     * Filter spells by level
     */
    filterByLevel(level: number): Spell[] {
        return this.spells.filter((s) => s.level === level);
    }

    /**
     * Filter spells by school
     */
    filterBySchool(school: string): Spell[] {
        return this.spells.filter((s) => s.school.toLowerCase() === school.toLowerCase());
    }

    /**
     * Filter spells by class
     */
    filterByClass(className: string): Spell[] {
        const lowerClass = className.toLowerCase();
        return this.spells.filter((s) =>
            s.classes.some((c) => c.toLowerCase().includes(lowerClass))
        );
    }

    /**
     * Search spells by name or text
     */
    search(query: string): Spell[] {
        const lowerQuery = query.toLowerCase();
        return this.spells.filter(
            (s) =>
                s.name.toLowerCase().includes(lowerQuery) ||
                s.text.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Sort spells by level (ascending or descending)
     */
    sortByLevel(ascending: boolean = true): Spell[] {
        return [...this.spells].sort((a, b) =>
            ascending ? a.level - b.level : b.level - a.level
        );
    }

    /**
     * Sort spells alphabetically by name
     */
    sortByName(ascending: boolean = true): Spell[] {
        return [...this.spells].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return ascending ? comparison : -comparison;
        });
    }

    /**
     * Clear all spells
     */
    clear(): void {
        this.#storage.current = [];
    }
}

export const spellStore = new SpellStore();
