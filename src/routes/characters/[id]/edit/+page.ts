import {app} from "$lib/stores/app.svelte";

export const ssr = false;

export function load({params}) {
    return {
        character: app.current.characters.find((c: any) => c.id === params.id)
    };
}
