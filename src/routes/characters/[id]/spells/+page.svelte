<script lang="ts">
    import { characters, spells as spellsStore } from "$lib/stores/stores";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import CharacterCard from "$lib/components/CharacterCard.svelte";
    import { formatSpellLevelLong } from "$lib/utils/spell-formatter";
    import { ArrowLeft, ArrowRight, Check, Circle, CircleCheckBig, Star } from "@lucide/svelte";
    import { Accordion } from "@skeletonlabs/skeleton-svelte";
    import { slide } from "svelte/transition";
    import type { Character } from "$lib/types/character";
    import type { FreeCastSpell } from "$lib/types/freeCastSpell";
    import type { SpellNote } from "$lib/types/spellNote";
    import type { Spell } from "$lib/types/spell";

    const { data } = $props();
    let character: Character = $derived.by(() => characters.current.find((c: any) => c.id === data.characterId));

    let search = $state("");
    let levelFilters = $state<number[]>([]);
    let classFilters = $state<string[]>([]);
    let openSpellId = $state<string[]>([]);

    const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    let availableClasses: string[] = $derived.by(() => {
        const classes: string[] = spellsStore.current.flatMap((spell: Spell) => spell.classes ?? []);
        return [...new Set<string>(classes)].sort((a: string, b: string) => a.localeCompare(b));
    });

    let spells = $derived.by(() => {
        if (!character) return [];

        const allSpells = spellsStore.current;
        const term = search.trim().toLowerCase();

        const filtered = allSpells.filter((spell: Spell) => {
            const matchesSearch = term ? spell.name.toLowerCase().includes(term) : true;
            const matchesLevel = levelFilters.length > 0 ? levelFilters.includes(spell.level) : true;
            const matchesClass = classFilters.length > 0 ? classFilters.some((className) => (spell.classes ?? []).includes(className)) : true;
            return matchesSearch && matchesLevel && matchesClass;
        });

        return filtered.sort((a: Spell, b: Spell) => a.level - b.level || a.name.localeCompare(b.name));
    });

    const selectedCount = $derived((character?.selectedSpellIds ?? []).length);
    const alwaysPreparedCount = $derived((character?.alwaysPreparedSpellIds ?? []).length);
    const preparedCount = $derived((character?.preparedSpellIds ?? []).length);

    function uniqueIds(values: string[]) {
        return values.filter((value, index) => values.indexOf(value) === index);
    }

    function levelLabel(level: number) {
        if (level === 0) return "Cantrip";
        return `${level}`;
    }

    function toggleLevelFilter(level: number) {
        if (levelFilters.includes(level)) {
            levelFilters = levelFilters.filter((current) => current !== level);
        } else {
            levelFilters = [...levelFilters, level].sort((a, b) => a - b);
        }
    }

    function toggleClassFilter(className: string) {
        if (classFilters.includes(className)) {
            classFilters = classFilters.filter((current) => current !== className);
        } else {
            classFilters = [...classFilters, className].sort((a, b) => a.localeCompare(b));
        }
    }

    function clearFilters() {
        levelFilters = [];
        classFilters = [];
    }

    function isSelected(spellId: string) {
        return (character?.selectedSpellIds ?? []).includes(spellId);
    }

    function isPrepared(spellId: string) {
        return (character?.preparedSpellIds ?? []).includes(spellId);
    }

    function isAlwaysPrepared(spellId: string) {
        return (character?.alwaysPreparedSpellIds ?? []).includes(spellId);
    }

    function toggleSelected(spellId: string) {
        if (!character) return;

        const selected = character.selectedSpellIds ?? [];
        if (selected.includes(spellId)) {
            character.preparedSpellIds = (character.preparedSpellIds ?? []).filter((id) => id !== spellId);
            character.alwaysPreparedSpellIds = (character.alwaysPreparedSpellIds ?? []).filter((id) => id !== spellId);
            character.freePerLongRestSpells = (character.freePerLongRestSpells ?? []).filter((entry) => entry.spellId !== spellId);
            character.freePerShortRestSpells = (character.freePerShortRestSpells ?? []).filter((entry) => entry.spellId !== spellId);
            character.spellNotes = (character.spellNotes ?? []).filter((entry) => entry.spellId !== spellId);
            if (character.concentrationSpellId === spellId) {
                character.concentrationSpellId = null;
            }
            character.selectedSpellIds = selected.filter((id) => id !== spellId);
        } else {
            character.selectedSpellIds = uniqueIds([...selected, spellId]);
        }
    }

    function togglePrepared(spellId: string) {
        if (!character) return;

        if (!isSelected(spellId)) {
            character.selectedSpellIds = uniqueIds([...(character.selectedSpellIds ?? []), spellId]);
        }

        if (isPrepared(spellId)) {
            character.preparedSpellIds = (character.preparedSpellIds ?? []).filter((id) => id !== spellId);
        } else {
            character.preparedSpellIds = uniqueIds([...(character.preparedSpellIds ?? []), spellId]);
        }
    }

    function toggleAlwaysPrepared(spellId: string) {
        if (!character) return;

        if (!isSelected(spellId)) {
            character.selectedSpellIds = uniqueIds([...(character.selectedSpellIds ?? []), spellId]);
        }

        if (isAlwaysPrepared(spellId)) {
            character.alwaysPreparedSpellIds = (character.alwaysPreparedSpellIds ?? []).filter((id) => id !== spellId);
        } else {
            character.alwaysPreparedSpellIds = uniqueIds([...(character.alwaysPreparedSpellIds ?? []), spellId]);
        }
    }

    function getCount(list: FreeCastSpell[], spellId: string) {
        return list?.find((entry: FreeCastSpell) => entry.spellId === spellId)?.total ?? 0;
    }

    function getNote(list: SpellNote[], spellId: string) {
        return list?.find((entry: SpellNote) => entry.spellId === spellId)?.text ?? "";
    }

    function setCount(kind: "long" | "short", spellId: string, next: number) {
        if (!character) return;

        if (!isSelected(spellId)) {
            character.selectedSpellIds = uniqueIds([...(character.selectedSpellIds ?? []), spellId]);
        }

        const listKey = kind === "long" ? "freePerLongRestSpells" : "freePerShortRestSpells";
        const list = character[listKey] ?? [];
        const count = Math.max(0, Math.min(99, Math.floor(Number(next) || 0)));
        const index = list.findIndex((entry: FreeCastSpell) => entry.spellId === spellId);

        let nextList: FreeCastSpell[];
        if (count === 0) {
            nextList = index === -1 ? list : list.filter((entry: FreeCastSpell) => entry.spellId !== spellId);
        } else if (index === -1) {
            nextList = [...list, { spellId, total: count, used: 0, why: "" }];
        } else {
            nextList = list.map((entry: FreeCastSpell) => {
                if (entry.spellId !== spellId) return entry;
                const nextUsed = Math.min(entry.used ?? 0, count);
                return { ...entry, total: count, used: nextUsed };
            });
        }

        character[listKey] = nextList;
    }

    function setNote(spellId: string, next: string) {
        if (!character) return;

        if (!isSelected(spellId) && String(next ?? "").trim()) {
            character.selectedSpellIds = uniqueIds([...(character.selectedSpellIds ?? []), spellId]);
        }

        const list = character.spellNotes ?? [];
        const note = String(next ?? "").trim();
        const index = list.findIndex((entry: SpellNote) => entry.spellId === spellId);

        let nextList: SpellNote[];
        if (!note) {
            nextList = index === -1 ? list : list.filter((entry: SpellNote) => entry.spellId !== spellId);
        } else if (index === -1) {
            nextList = [...list, { spellId, text: note }];
        } else {
            nextList = list.map((entry: SpellNote) => (entry.spellId === spellId ? { ...entry, text: note } : entry));
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

    function togglePreparedFromHeader(spellId: string, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        togglePrepared(spellId);
    }

    function selectFirstSearchResult(event: KeyboardEvent) {
        if (event.key !== "Enter") return;
        if (!character) return;

        const firstSpell = spells[0];
        if (!firstSpell) return;

        event.preventDefault();
        if (!isSelected(firstSpell.id)) {
            character.selectedSpellIds = uniqueIds([...(character.selectedSpellIds ?? []), firstSpell.id]);
        }

        search = "";
    }

    function goBack() {
        history.back();
    }
</script>

<div class="space-y-4">
    {#if character}
        <div class="flex justify-between gap-2">
            <button class="flex gap-2 items-center" onclick={goBack}>
                <ArrowLeft />
                Back
            </button>
            <button class="flex gap-2 items-center" onclick={() => (window.location.href = `/characters/${character.id}`)}>
                View
                <ArrowRight />
            </button>
        </div>

        <CharacterCard {character} />

        <div class="card preset-filled-surface-100-900 p-4 space-y-2">
            <SectionHeader title="Spellbook Manager" subtitle="Select spells for this character, then configure prepared/always prepared/free casts." />
            <div class="flex flex-wrap gap-2 text-xs">
                <span class="badge preset-filled-surface-500">Selected {selectedCount}</span>
                <span class="badge preset-filled-surface-500">Prepared {preparedCount}/{character.preparedSpellsLimit}</span>
                <span class="badge preset-filled-surface-500">Always Prepared {alwaysPreparedCount}</span>
            </div>
        </div>

        <label class="label">
            <span class="label-text">Search spells</span>
            <input class="input preset-tonal" type="text" bind:value={search} placeholder="Find a spell by name..." autocomplete="off" onkeydown={selectFirstSearchResult} />
        </label>
        <div class="card p-3 preset-tonal space-y-3">
            <div class="space-y-1">
                <p class="text-xs uppercase tracking-wide opacity-70">Filter by level</p>
                <div class="flex flex-wrap gap-2">
                    {#each spellLevels as level (level)}
                        <button
                            class="btn btn-sm"
                            class:preset-filled-primary-500={levelFilters.includes(level)}
                            class:preset-tonal={!levelFilters.includes(level)}
                            onclick={() => toggleLevelFilter(level)}>
                            {levelLabel(level)}
                        </button>
                    {/each}
                </div>
            </div>
            <div class="space-y-1">
                <p class="text-xs uppercase tracking-wide opacity-70">Filter by class</p>
                <div class="flex flex-wrap gap-2">
                    {#each availableClasses as className (className)}
                        <button
                            class="btn btn-sm"
                            class:preset-filled-secondary-500={classFilters.includes(className)}
                            class:preset-tonal={!classFilters.includes(className)}
                            onclick={() => toggleClassFilter(className)}>
                            {className}
                        </button>
                    {/each}
                </div>
            </div>
            <div>
                <button class="btn btn-sm preset-tonal" onclick={clearFilters}>Clear filters</button>
            </div>
        </div>
        <p class="text-xs opacity-70">Use Prepared in the header for quick toggles. Expand only for Select/Always/Free-casts/Notes.</p>
        {#if spells.length === 0}
            <p class="text-center opacity-70">No spells match this search.</p>
        {:else}
            <Accordion collapsible value={openSpellId} onValueChange={(details) => (openSpellId = details.value)}>
                {#each spells as spell (spell.id)}
                    <Accordion.Item value={spell.id} class="preset-tonal border-l-4 border-l-primary-500 rounded-r-2xl" style={`filter: hue-rotate(${spell.level * 90}deg)`}>
                        <Accordion.ItemTrigger class="font-bold flex items-center justify-between gap-3">
                            <div>
                                <div class="font-semibold">{spell.name}</div>
                                <div class="text-xs opacity-70">{formatSpellLevelLong(spell.level)}</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button
                                    class="btn btn-sm"
                                    class:preset-filled-secondary-500={isPrepared(spell.id)}
                                    class:preset-tonal={!isPrepared(spell.id)}
                                    onclick={(event) => togglePreparedFromHeader(spell.id, event)}>
                                    {#if isPrepared(spell.id)}
                                        Prepared
                                        <CircleCheckBig />
                                    {:else}
                                        Mark Prepared
                                        <Circle />
                                    {/if}
                                </button>
                                <Accordion.ItemIndicator class="group">
                                    <div class="flex items-center gap-2 text-xs">
                                        {#if isSelected(spell.id)}
                                            <span class="badge preset-filled-primary-500">Selected</span>
                                        {/if}
                                        {#if isPrepared(spell.id)}
                                            <span class="badge preset-filled-secondary-500">Prepared</span>
                                        {/if}
                                        {#if isAlwaysPrepared(spell.id)}
                                            <span class="badge preset-filled-tertiary-500">Always</span>
                                        {/if}
                                        <span class="badge preset-filled-surface-500">Long {getCount(character.freePerLongRestSpells, spell.id)}</span>
                                        <span class="badge preset-filled-surface-500">Short {getCount(character.freePerShortRestSpells, spell.id)}</span>
                                    </div>
                                </Accordion.ItemIndicator>
                            </div>
                        </Accordion.ItemTrigger>
                        <Accordion.ItemContent>
                            {#snippet element(attributes)}
                                {#if !attributes.hidden}
                                    <div {...attributes} class="mt-3 grid gap-3 p-3" transition:slide={{ duration: 200 }}>
                                        <div class="grid gap-2 md:grid-cols-2">
                                            <button
                                                class="btn"
                                                class:preset-filled-primary-500={isSelected(spell.id)}
                                                class:preset-tonal={!isSelected(spell.id)}
                                                onclick={() => toggleSelected(spell.id)}>
                                                {#if isSelected(spell.id)}
                                                    Selected
                                                    <Check />
                                                {:else}
                                                    Select
                                                    <Circle />
                                                {/if}
                                            </button>
                                            <button
                                                class="btn"
                                                class:preset-filled-tertiary-500={isAlwaysPrepared(spell.id)}
                                                class:preset-tonal={!isAlwaysPrepared(spell.id)}
                                                onclick={() => toggleAlwaysPrepared(spell.id)}>
                                                Always Prepared
                                                {#if isAlwaysPrepared(spell.id)}
                                                    <Star />
                                                {:else}
                                                    <Circle />
                                                {/if}
                                            </button>
                                        </div>

                                        <div class="flex gap-4">
                                            <div class="grow">
                                                <p class="text-xs uppercase tracking-wide opacity-70">Long Rest</p>
                                                <div class="flex items-center gap-2">
                                                    <button class="btn btn-sm" onclick={() => stepCount("long", spell.id, -1)} disabled={getCount(character.freePerLongRestSpells, spell.id) <= 0}
                                                        >-
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={99}
                                                        class="input preset-tonal w-16 text-center"
                                                        value={getCount(character.freePerLongRestSpells, spell.id)}
                                                        oninput={(event) => handleCountInput("long", spell.id, event)} />
                                                    <button class="btn btn-sm" onclick={() => stepCount("long", spell.id, 1)}>+</button>
                                                </div>
                                            </div>
                                            <div class="grow">
                                                <p class="text-xs uppercase tracking-wide opacity-70">Short Rest</p>
                                                <div class="flex items-center gap-2">
                                                    <button class="btn btn-sm" onclick={() => stepCount("short", spell.id, -1)} disabled={getCount(character.freePerShortRestSpells, spell.id) <= 0}
                                                        >-
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={99}
                                                        class="input preset-tonal w-16 text-center"
                                                        value={getCount(character.freePerShortRestSpells, spell.id)}
                                                        oninput={(event) => handleCountInput("short", spell.id, event)} />
                                                    <button class="btn btn-sm" onclick={() => stepCount("short", spell.id, 1)}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-xs uppercase tracking-wide opacity-70">Notes</p>
                                            <textarea
                                                class="input preset-tonal min-h-24"
                                                rows="3"
                                                placeholder="Add custom notes for this spell..."
                                                value={getNote(character.spellNotes, spell.id)}
                                                oninput={(event) => handleNoteInput(spell.id, event)}></textarea>
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
