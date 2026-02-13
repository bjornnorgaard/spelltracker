import {LocalStorage} from "$lib/utils/storage.svelte";
import type {Spell} from "$lib/types/spell";
import type {Character} from "$lib/types/character";

const prefix = "spelltracker"
export const spells = new LocalStorage<Spell[]>(prefix + ":spells", []);
export const characters = new LocalStorage<Character[]>(prefix + ":characters", []);
