<script lang="ts">
    import {Brain, X} from "@lucide/svelte";
    import type {Spell} from "$lib/types/spell";
    import {slide} from "svelte/transition";

    interface Props {
        spell: Spell | null;
        onDrop: () => void;
    }

    let {spell, onDrop}: Props = $props();
</script>

{#if spell}
    <div class="card preset-filled-secondary-500 p-4" transition:slide={{ duration: 300 }}>
        <div class="flex justify-between items-center">
            <p class="text-sm font-bold uppercase tracking-wide opacity-90">{spell.duration}</p>
            <button class="btn" onclick={onDrop} aria-label="Drop concentration"><X/></button>
        </div>
        <p class="text-sm opacity-70"></p>
        <p class="text-xl font-bold flex gap-2 items-center">{spell.name}<Brain class="animate-pulse"/></p>
        <p class="text-sm opacity-70 mt-2">
            <strong>Note:</strong> Taking damage or casting another concentration spell will break your concentration.
        </p>
    </div>
{/if}
