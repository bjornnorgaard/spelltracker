<script lang="ts">
    import {Brain, X} from "@lucide/svelte";
    import {fly} from "svelte/transition";
    import type {Spell} from "$lib/types/spell";

    interface Props {
        spell?: Spell;
        ondrop: () => void;
    }

    let {spell, ondrop}: Props = $props();
</script>

{#if spell}
    <div class="fixed preset-filled-secondary-500 px-4 py-2 border-b-4 border-b-secondary-300-700 shadow-2xl top-0 left-0 right-0 z-50" transition:fly={{ y: -100, duration: 300 }}>
        <div class="flex justify-between opacity-75 items-center">
            <p class="text-shadow-surface-200-800 font-bold uppercase tracking-widest">Currently Concentrating</p>
            <button onclick={ondrop}>
                <X/>
            </button>
        </div>
        <p class="preset-typo-headline flex gap-2 items-center">
            <Brain class="animate-pulse"/>
            {spell.name}
        </p>
        <p class="font-bold text-sm mt-2">{spell.duration}</p>
        <p class="text-xs opacity-75">Damage: Constitution save DC is half of the damage (rounded down), minimum of 10.</p>
    </div>
{/if}
