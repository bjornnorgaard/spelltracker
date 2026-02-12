import {LocalStorage} from "$lib/utils/storage.svelte";

const prefix = "spelltracker"

export const spells = new LocalStorage(prefix + ":spells", []);