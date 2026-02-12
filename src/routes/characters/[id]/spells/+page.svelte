<script lang="ts">
    import {app} from "$lib/stores/app.svelte.js";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import CharacterCard from "$lib/components/CharacterCard.svelte";
    import {formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {ArrowLeft, ArrowRight} from "@lucide/svelte";
    import {Accordion} from "@skeletonlabs/skeleton-svelte";
    import {slide} from "svelte/transition";
    import type {Character} from "$lib/types/character";
    import type {FreeCastSpell} from "$lib/types/freeCastSpell";
    import type {SpellNote} from "$lib/types/spellNote";
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

    function getCount(list: FreeCastSpell[], spellId: string) {
        return list?.find((entry: FreeCastSpell) => entry.spellId === spellId)?.total ?? 0;
    }

    function getNote(list: SpellNote[], spellId: string) {
        return list?.find((entry: SpellNote) => entry.spellId === spellId)?.text ?? "";
    }

    function setCount(kind: "long" | "short", spellId: string, next: number) {
        if (!character) return;
        const listKey = kind === "long" ? "freePerLongRestSpells" : "freePerShortRestSpells";
        const list = character[listKey] ?? [];
        const count = Math.max(0, Math.min(99, Math.floor(Number(next) || 0)));
        const index = list.findIndex((entry: FreeCastSpell) => entry.spellId === spellId);

        let nextList: FreeCastSpell[];
        if (count === 0) {
            nextList = index === -1 ? list : list.filter((entry: FreeCastSpell) => entry.spellId !== spellId);
        } else if (index === -1) {
            nextList = [...list, {spellId, total: count, used: 0}];
        } else {
            nextList = list.map((entry: FreeCastSpell) => {
                if (entry.spellId !== spellId) return entry;
                const nextUsed = Math.min(entry.used ?? 0, count);
                return {...entry, total: count, used: nextUsed};
            });
        }

        character[listKey] = nextList;
    }

    function setNote(spellId: string, next: string) {
        if (!character) return;
        const list = character.spellNotes ?? [];
        const note = String(next ?? "").trim();
        const index = list.findIndex((entry: SpellNote) => entry.spellId === spellId);

        let nextList: SpellNote[];
        if (!note) {
            nextList = index === -1 ? list : list.filter((entry: SpellNote) => entry.spellId !== spellId);
        } else if (index === -1) {
            nextList = [...list, {spellId, text: note}];
        } else {
            nextList = list.map((entry: SpellNote) => entry.spellId === spellId ? {...entry, text: note} : entry);
        }

        character.spellNotes = nextList;
    }

    function stepCount(kind: "long" | "short", spellId: string, delta: number) {
        const list = kind === "long" ? character?.freePerLongRestSpells : character?.freePerShortRestSpells;
        setCount(kind, spellId, getCount(list ?? [], spellId) + delta);
    }

    function handleCountInput(kind: "long" | "short", spellId: string, event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        setCount(kind, spellId, Number(input.value));
    }

    function handleNoteInput(spellId: string, event: Event) {
        const input = event.currentTarget as HTMLTextAreaElement;
        setNote(spellId, input.value);
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
                                    <div {...attributes} class="mt-3 grid gap-3 p-3" transition:slide={{ duration: 200 }}>
                                        <div class="flex gap-4">
                                            <div class="grow">
                                                <p class="text-xs uppercase tracking-wide opacity-70">Long Rest</p>
                                                <div class="flex items-center gap-2">
                                                    <button class="btn btn-sm" onclick={() => stepCount("long", spell.id, -1)} disabled={getCount(character.freePerLongRestSpells, spell.id) <= 0}>-</button>
                                                    <input type="number" min={0} max={99} class="input preset-tonal w-16 text-center" value={getCount(character.freePerLongRestSpells, spell.id)} oninput={(event) => handleCountInput("long", spell.id, event)}>
                                                    <button class="btn btn-sm" onclick={() => stepCount("long", spell.id, 1)}>+</button>
                                                </div>
                                            </div>
                                            <div class="grow">
                                                <p class="text-xs uppercase tracking-wide opacity-70">Short Rest</p>
                                                <div class="flex items-center gap-2">
                                                    <button class="btn btn-sm" onclick={() => stepCount("short", spell.id, -1)} disabled={getCount(character.freePerShortRestSpells, spell.id) <= 0}>-</button>
                                                    <input type="number" min={0} max={99} class="input preset-tonal w-16 text-center" value={getCount(character.freePerShortRestSpells, spell.id)} oninput={(event) => handleCountInput("short", spell.id, event)}>
                                                    <button class="btn btn-sm" onclick={() => stepCount("short", spell.id, 1)}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-xs uppercase tracking-wide opacity-70">Notes</p>
                                            <textarea
                                                    class="input preset-tonal min-h-[96px]"
                                                    rows="3"
                                                    placeholder="Add custom notes for this spell..."
                                                    value={getNote(character.spellNotes, spell.id)}
                                                    oninput={(event) => handleNoteInput(spell.id, event)}
                                            ></textarea>
                                        </div>
                                    </div>
                                {/if}
                            {/snippet}
                        </Accordion.ItemContent>
                    </Accordion.Item>
                {/each}
            </Accordion>
        {/if}
    {/if}
</div>
