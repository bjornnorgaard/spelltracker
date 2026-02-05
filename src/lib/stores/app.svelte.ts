import {LocalStorage} from "$lib/utils/storage.svelte";

export const app = new LocalStorage("spelltracker", {
    spells: [],
    characters: [],
});