import {app} from "$lib/stores/app.svelte";

export const ssr = false;

export function load({params}) {
    return {
        spell: app.current.spells.find((s: any) => s.id === params.id)
    };
}