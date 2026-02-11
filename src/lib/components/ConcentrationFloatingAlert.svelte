<script lang="ts">
    import { Brain, X } from "@lucide/svelte";
    import { fly } from "svelte/transition";
    import type { Spell } from "$lib/types/spell";

    interface Props {
        spell?: Spell;
        ondrop: () => void;
    }

    let { spell, ondrop }: Props = $props();
</script>

{#if spell}
    <div class="fixed top-0 left-0 right-0 z-50 p-4" transition:fly={{ y: -100, duration: 300 }}>
        <div class="preset-filled-secondary-500 p-4 card flex justify-between shadow-2xl">
            <div></div>
            <div class="flex flex-col items-center">
                <p class="preset-typo-title flex text-center items-center gap-2">
                    <Brain size={24} class="animate-pulse" />
                    {spell.name}
                </p>
                <p class="font-bold text-sm">{spell.duration}</p>
            </div>
            <div class="">
                <button class="btn" onclick={ondrop}>
                    <X />
                </button>
            </div>
        </div>
    </div>
{/if}
