import {app} from "$lib/stores/app.svelte";

export const ssr = false;

export function load({params}) {
    return {
        characterId: params.id,
    };
}
