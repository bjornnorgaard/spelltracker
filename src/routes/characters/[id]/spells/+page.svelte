<script lang="ts">
    import {app} from "$lib/stores/app.svelte.js";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import CharacterCard from "$lib/components/CharacterCard.svelte";
    import {formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {ArrowLeft, ArrowRight} from "@lucide/svelte";
    import {Accordion} from "@skeletonlabs/skeleton-svelte";
    import {slide} from "svelte/transition";
    import type {Character} from "$lib/types/character";
    import type {FreeCast} from "$lib/types/freeCast";
    import type {Spell} from "$lib/types/spell";

    const {data} = $props();
    let character: Character = $derived.by(() => app.current.characters.find((c: any) => c.id === data.characterId));

    let search = $state("");
    let openSpellId = $state<string[]>([]);

    let spells = $derived.by(() => {
        if (!character) return [];
        const allSpells = app.current.spells.filter((spell: Spell) => character.spellIds?.includes(spell.id));
        const term = search.trim().toLowerCase();
        const filtered = term ? allSpells.filter((spell: Spell) => spell.name.toLowerCase().includes(term)) : allSpells;
        return filtered.sort((a: Spell, b: Spell) => a.level - b.level || a.name.localeCompare(b.name));
    });

    function getCount(list: FreeCast[], spellId: string) {
        return list?.find((entry: FreeCast) => entry.spellId === spellId)?.count ?? 0;
    }

    function setCount(kind: "long" | "short", spellId: string, next: number) {
        if (!character) return;
        const listKey = kind === "long" ? "freePerLongRestSpells" : "freePerShortRestSpells";
        const list = character[listKey] ?? [];
        const count = Math.max(0, Math.min(99, Math.floor(Number(next) || 0)));
        const index = list.findIndex((entry: FreeCast) => entry.spellId === spellId);

        let nextList: FreeCast[];
        if (count === 0) {
            nextList = index === -1 ? list : list.filter((entry: FreeCast) => entry.spellId !== spellId);
        } else if (index === -1) {
            nextList = [...list, {spellId, count}];
        } else {
            nextList = list.map((entry: FreeCast) => entry.spellId === spellId ? {...entry, count} : entry);
        }

        character[listKey] = nextList;
    }

    function stepCount(kind: "long" | "short", spellId: string, delta: number) {
        const list = kind === "long" ? character?.freePerLongRestSpells : character?.freePerShortRestSpells;
        setCount(kind, spellId, getCount(list ?? [], spellId) + delta);
    }

    function handleCountInput(kind: "long" | "short", spellId: string, event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        setCount(kind, spellId, Number(input.value));
    }

    function goBack() {
        history.back();
    }
</script>

<div class="space-y-4">
    {#if character}
        <div class="flex justify-between gap-2">
            <button class="flex gap-2 items-center" onclick={goBack}>
                <ArrowLeft/>
                Back
            </button>
            <a class="flex gap-2 items-center" href={`/characters/${character.id}/edit`}>
                Edit
                <ArrowRight/>
            </a>
        </div>

        <CharacterCard character={character}/>

        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Free Casts" subtitle="Set how many times each spell can be cast for free per rest."/>
            <label class="label">
                <span class="label-text">Search spells</span>
                <input class="input preset-tonal" type="text" bind:value={search} placeholder="Find a spell..." autocomplete="off">
            </label>
            <p class="text-xs opacity-70">Use 0 to remove a spell from free casts.</p>
            {#if spells.length === 0}
                <p class="text-center opacity-70">No spells match this search.</p>
            {:else}
                <Accordion collapsible value={openSpellId} onValueChange={(details) => (openSpellId = details.value)}>
                    {#each spells as spell (spell.id)}
                        <Accordion.Item value={spell.id} class="preset-tonal border-l-4 border-l-primary-500 rounded-r-2xl" style={`filter: hue-rotate(${(spell.level) * 90}deg)`}>
                            <Accordion.ItemTrigger class="font-bold flex items-center justify-between gap-3">
                                <div>
                                    <div class="font-semibold">{spell.name}</div>
                                    <div class="text-xs opacity-70">{formatSpellLevelLong(spell.level)}</div>
                                </div>
                                <Accordion.ItemIndicator class="group">
                                    <div class="flex items-center gap-2 text-xs">
                                        <span class="badge preset-filled-surface-500">Long {getCount(character.freePerLongRestSpells, spell.id)}</span>
                                        <span class="badge preset-filled-surface-500">Short {getCount(character.freePerShortRestSpells, spell.id)}</span>
                                    </div>
                                </Accordion.ItemIndicator>
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                {#snippet element(attributes)}
                                    {#if !attributes.hidden}
                                        <div {...attributes} class="mt-3 grid gap-3 sm:grid-cols-2 p-3" transition:slide={{ duration: 200 }}>
                                            <div class="space-y-1">
                                                <p class="text-xs uppercase tracking-wide opacity-70">Long Rest</p>
                                                <div class="flex items-center gap-2">
                                                    <button class="btn btn-sm" onclick={() => stepCount("long", spell.id, -1)} disabled={getCount(character.freePerLongRestSpells, spell.id) <= 0}>-</button>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={99}
                                                        class="input preset-tonal w-16 text-center"
                                                        value={getCount(character.freePerLongRestSpells, spell.id)}
                                                        oninput={(event) => handleCountInput("long", spell.id, event)}>
                                                    <button class="btn btn-sm" onclick={() => stepCount("long", spell.id, 1)}>+</button>
                                                </div>
                                            </div>
                                            <div class="space-y-1">
                                                <p class="text-xs uppercase tracking-wide opacity-70">Short Rest</p>
                                                <div class="flex items-center gap-2">
                                                    <button class="btn btn-sm" onclick={() => stepCount("short", spell.id, -1)} disabled={getCount(character.freePerShortRestSpells, spell.id) <= 0}>-</button>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={99}
                                                        class="input preset-tonal w-16 text-center"
                                                        value={getCount(character.freePerShortRestSpells, spell.id)}
                                                        oninput={(event) => handleCountInput("short", spell.id, event)}>
                                                    <button class="btn btn-sm" onclick={() => stepCount("short", spell.id, 1)}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                    {/if}
                                {/snippet}
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    {/each}
                </Accordion>
            {/if}
        </div>
    {/if}
</div>
