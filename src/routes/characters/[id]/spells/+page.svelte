<script lang="ts">
    import {characters, spells} from "$lib/stores/stores";
    import {formatSpellLevel, formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {Circle, CircleCheckBig, CircleMinus, CirclePlus, Star} from "@lucide/svelte";
    import {Accordion} from "@skeletonlabs/skeleton-svelte";
    import {slide} from "svelte/transition";
    import type {Character} from "$lib/types/character";
    import type {FreeCastSpell} from "$lib/types/freeCastSpell";
    import type {SpellNote} from "$lib/types/spellNote";
    import type {Spell} from "$lib/types/spell";
    import Section from "$lib/components/Section.svelte";
    import {DEFAULT_SPELLCASTING_ABILITY_SCORE, DND_CLASSES} from "$lib/utils/constants";
    import {
        spellMatchesSubclassFilters,
        spellsSuggestSubclassReimport,
        splitSpellSubclassLabels,
        subclassLabelClassPrefix,
    } from "$lib/utils/spell-import";
    import {calculateSpellSaveDc, getAbilityModifier, getProficiencyBonusForLevel} from "$lib/utils/spell-save-dc";
    import {getSavingThrowAbility, spellRequiresSavingThrow} from "$lib/utils/spell-save-parser";

    const {data} = $props();
    let character: Character = $derived.by(() => characters.current.find((c: any) => c.id === data.characterId));

    let search = $state("");
    let levelFilters = $state<number[]>([]);
    /** At most one class; `null` means no class filter. */
    let selectedClassFilter = $state<string | null>(null);
    let subclassFilters = $state<string[]>([]);
    let selectedSpellsOnly = $state(false);
    let openSpellId = $state<string[]>([]);

    const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    let availableClasses: string[] = $derived.by(() => {
        const classes: string[] = spells.current.flatMap((spell: Spell) => spell.classes ?? []);
        return [...new Set<string>(classes)].sort((a: string, b: string) => a.localeCompare(b));
    });

    let availableSubclasses: string[] = $derived.by(() => {
        if (selectedClassFilter == null) return [];

        const byKey: Record<string, string> = {};
        for (const spell of spells.current) {
            for (const label of splitSpellSubclassLabels(spell.subclasses ?? "")) {
                const prefix = subclassLabelClassPrefix(label);
                if (prefix == null || prefix !== selectedClassFilter) continue;
                const key = label.toLowerCase();
                if (!(key in byKey)) byKey[key] = label;
            }
        }
        return Object.values(byKey).sort((a, b) => a.localeCompare(b));
    });

    let filteredSpells = $derived.by(() => {
        if (!character) return [];

        const allSpells = spells.current;
        const term = search.trim().toLowerCase();
        const selectedIdSet = new Set(character.selectedSpellIds ?? []);

        const filtered = allSpells.filter((spell: Spell) => {
            if (selectedSpellsOnly && !selectedIdSet.has(spell.id)) return false;
            const matchesSearch = term ? spell.name.toLowerCase().includes(term) : true;
            const matchesLevel = levelFilters.length > 0 ? levelFilters.includes(spell.level) : true;
            const matchesClass =
                selectedClassFilter != null ? (spell.classes ?? []).includes(selectedClassFilter) : true;
            const matchesSubclass = spellMatchesSubclassFilters(spell.subclasses, subclassFilters);
            return matchesSearch && matchesLevel && matchesClass && matchesSubclass;
        });

        return filtered.sort((a: Spell, b: Spell) => a.level - b.level || a.name.localeCompare(b.name)).slice(0, 100);
    });

    const selectedCount = $derived((character?.selectedSpellIds ?? []).length);
    const alwaysPreparedCount = $derived((character?.alwaysPreparedSpellIds ?? []).length);
    const preparedCount = $derived((character?.preparedSpellIds ?? []).length);
    const proficiencyBonus = $derived(getProficiencyBonusForLevel(character?.level ?? 1));
    const spellcastingAbilityScore = $derived(
        Number.isFinite(character?.spellcastingAbilityScore)
            ? character.spellcastingAbilityScore
            : DEFAULT_SPELLCASTING_ABILITY_SCORE
    );
    const spellcastingAbilityModifier = $derived(getAbilityModifier(spellcastingAbilityScore));
    const spellSaveDc = $derived(calculateSpellSaveDc({proficiencyBonus, spellcastingAbilityModifier}));

    const showSubclassReimportHint = $derived(spellsSuggestSubclassReimport(spells.current as Spell[]));

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
        if (selectedClassFilter === className) {
            selectedClassFilter = null;
            subclassFilters = [];
            return;
        }

        selectedClassFilter = className;
        subclassFilters = subclassFilters.filter((label) => {
            const prefix = subclassLabelClassPrefix(label);
            return prefix != null && prefix === className;
        });
    }

    function toggleSubclassFilter(label: string) {
        if (subclassFilters.includes(label)) {
            subclassFilters = subclassFilters.filter((current) => current !== label);
        } else {
            subclassFilters = [...subclassFilters, label].sort((a, b) => a.localeCompare(b));
        }
    }

    function clearFilters() {
        levelFilters = [];
        selectedClassFilter = null;
        subclassFilters = [];
        selectedSpellsOnly = false;
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

    function getSelectionMode(spellId: string): "none" | "selected" | "prepared" | "always" {
        if (isAlwaysPrepared(spellId)) return "always";
        if (isPrepared(spellId)) return "prepared";
        if (isSelected(spellId)) return "selected";
        return "none";
    }

    function showSelectedBadge(spellId: string) {
        return isSelected(spellId) && !isPrepared(spellId) && !isAlwaysPrepared(spellId);
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

    function applySelectionMode(spellId: string, mode: "none" | "selected" | "prepared" | "always") {
        if (!character) return;

        if (mode === "none") {
            const hasSelected = (character.selectedSpellIds ?? []).includes(spellId);
            character.preparedSpellIds = (character.preparedSpellIds ?? []).filter((id) => id !== spellId);
            character.alwaysPreparedSpellIds = (character.alwaysPreparedSpellIds ?? []).filter((id) => id !== spellId);
            if (hasSelected) {
                toggleSelected(spellId);
            }
            return;
        }

        const selected = uniqueIds([...(character.selectedSpellIds ?? []), spellId]);
        const preparedBase = (character.preparedSpellIds ?? []).filter((id) => id !== spellId);
        const alwaysBase = (character.alwaysPreparedSpellIds ?? []).filter((id) => id !== spellId);

        character.selectedSpellIds = selected;
        character.preparedSpellIds = mode === "prepared" ? uniqueIds([...preparedBase, spellId]) : preparedBase;
        character.alwaysPreparedSpellIds = mode === "always" ? uniqueIds([...alwaysBase, spellId]) : alwaysBase;
    }

    function toggleSelectionMode(spellId: string, mode: "selected" | "prepared" | "always") {
        const current = getSelectionMode(spellId);
        applySelectionMode(spellId, current === mode ? "none" : mode);
    }

    function togglePrepared(spellId: string) {
        if (!character) return;

        toggleSelectionMode(spellId, "prepared");
    }

    function toggleAlwaysPrepared(spellId: string) {
        if (!character) return;

        toggleSelectionMode(spellId, "always");
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
            nextList = [...list, {spellId, total: count, used: 0, why: ""}];
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
            nextList = [...list, {spellId, text: note}];
        } else {
            nextList = list.map((entry: SpellNote) => (entry.spellId === spellId ? {...entry, text: note} : entry));
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
        // If this was a cantrip (level 0) and the user clicked the header 'Prepare' button
        // treat it as 'always prepared' so it does not count against the prepared spells limit.
        const spell = spells.current.find((s: Spell) => s.id === spellId);
        if (spell && spell.level === 0) {
            toggleSelectionMode(spellId, "always");
        } else {
            togglePrepared(spellId);
        }
    }

    function selectFirstSearchResult(event: KeyboardEvent) {
        if (event.key !== "Enter") return;
        if (!character) return;

        const firstSpell = filteredSpells[0];
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

<div class="space-y-8">
    <Section title="Overview" subtitle="Select spells for this character, then configure prepared/always prepared/free casts">
        <div class="flex flex-wrap gap-4">
            <span class="badge grow preset-filled-surface-500">Selected {selectedCount}</span>
            <span class="badge grow preset-filled-surface-500">Prepared {preparedCount}/{character.preparedSpellsLimit}</span>
            <span class="badge grow preset-filled-surface-500">Always Prepared {alwaysPreparedCount}</span>
        </div>
    </Section>

    <Section title="Filters" subtitle="Find spells and verify key fields quickly">
        {#if showSubclassReimportHint}
            <aside class="card preset-filled-warning-500 p-4 space-y-2 mb-4">
                <p class="font-semibold">Spell data update</p>
                <p class="text-sm opacity-95">
                    Spelltracker has been updated to add subclass information from your spell import lookup. Your saved spells do not include that data yet. Re-import spells to enable subclass filters and subclass labels on spells.
                </p>
                <a href="/spells/import" class="btn preset-tonal w-full sm:w-auto">Re-import spells</a>
            </aside>
        {/if}
        <div class="card p-4 preset-tonal space-y-4">
            <p class="uppercase tracking-wide opacity-70">Filter by Name</p>
            <label class="label">
                <input class="input preset-tonal" type="search" bind:value={search}
                       placeholder="Find a spell by name..." autocomplete="off"/>
            </label>

            <p class="uppercase tracking-wide opacity-70">Filter by level</p>
            <div class="flex flex-wrap gap-2">
                {#each character.spellSlots as slot (slot.level)}
                    <button class="btn btn-sm grow" onclick={() => toggleLevelFilter(slot.level)}
                            class:preset-filled-primary-500={levelFilters.includes(slot.level)}
                            class:preset-tonal={!levelFilters.includes(slot.level)}>
                        {formatSpellLevel(slot.level)}
                    </button>
                {/each}
            </div>
            <p class="uppercase tracking-wide opacity-70">Filter by class</p>
            <div class="flex flex-wrap gap-2">
                {#each DND_CLASSES as className (className)}
                    <button class="btn btn-sm grow"
                            class:preset-filled-secondary-500={selectedClassFilter === className}
                            class:preset-tonal={selectedClassFilter !== className}
                            onclick={() => toggleClassFilter(className)}>
                        {className}
                    </button>
                {/each}
            </div>
            {#if selectedClassFilter != null && availableSubclasses.length > 0}
                <p class="uppercase tracking-wide opacity-70">Filter by subclass</p>
                <div class="flex flex-wrap gap-2">
                    {#each availableSubclasses as label (label)}
                        <button class="btn btn-sm grow"
                                class:preset-filled-tertiary-500={subclassFilters.includes(label)}
                                class:preset-tonal={!subclassFilters.includes(label)}
                                onclick={() => toggleSubclassFilter(label)}
                                title={label}>
                            {label}
                        </button>
                    {/each}
                </div>
            {/if}
            <p class="uppercase tracking-wide opacity-70">Selection</p>
            <label class="flex items-center gap-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedSpellsOnly}/>
                <span>Only show spells selected for this character</span>
            </label>
            <p class="uppercase tracking-wide opacity-70">Actions</p>
            <button class="btn w-full preset-tonal-primary" onclick={clearFilters}>Clear filters</button>
        </div>
    </Section>

    <Accordion collapsible value={openSpellId} onValueChange={(details) => (openSpellId = details.value)}>
        {#each filteredSpells as spell (spell.id)}
            <Accordion.Item value={spell.id}
                            class="preset-tonal border-l-2 border-l-primary-500 rounded-r-xl"
                            style={`filter: hue-rotate(${spell.level * 90}deg)`}>
                <Accordion.ItemTrigger class="font-bold flex items-start justify-between gap-3">
                    <div class="w-full">
                        <div class="text-xs opacity-70">{formatSpellLevelLong(spell.level)}</div>
                        <div class="flex items-center justify-between">
                            <span class="font-semibold">{spell.name}</span>
                            {#if isPrepared(spell.id)}
                                <button class="badge preset-filled-primary-500" onclick={(event) => togglePreparedFromHeader(spell.id, event)}>
                                    Prepared
                                    <CircleCheckBig size="20"/>
                                </button>
                            {:else if isAlwaysPrepared(spell.id) || showSelectedBadge(spell.id)}
                                <span class="badge preset-filled-secondary-500">Always Prepared</span>
                            {:else}
                                <button class="badge" onclick={(event) => togglePreparedFromHeader(spell.id, event)}>
                                    Prepare
                                    <Circle size="20"/>
                                </button>
                            {/if}
                        </div>
                    </div>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                    {#snippet element(attributes)}
                        {#if !attributes.hidden}
                            <div {...attributes} class="space-y-4 p-4 card preset-filled-surface-100-900" transition:slide={{ duration: 200 }}>
                                <p class="preset-typo-headline tracking-wide">{spell.name}</p>
                                <div>
                                    <p><strong>School:</strong> {spell.school}</p>
                                    <p><strong>Casting time:</strong> {spell.castingTime}</p>
                                    <p><strong>Range:</strong> {spell.range}</p>
                                    <p><strong>Duration:</strong> {spell.duration}</p>
                                    <p><strong>Components:</strong> {spell.components}</p>
                                </div>
                                <div>
                                    <i>{spell.text}</i>
                                </div>
                                {#if spellRequiresSavingThrow(spell)}
                                    {@const saveAbility = getSavingThrowAbility(spell)}
                                    <div class="card p-3 preset-tonal">
                                        <p>
                                            <strong>Save Hint:</strong>
                                            {#if saveAbility}
                                                {saveAbility} save vs DC {spellSaveDc}
                                            {:else}
                                                Save vs DC {spellSaveDc}
                                            {/if}
                                        </p>
                                        <p class="text-sm opacity-70">
                                            Based on {character.spellcastingAbility} {spellcastingAbilityScore}
                                            ({spellcastingAbilityModifier >= 0 ? "+" : ""}{spellcastingAbilityModifier})
                                        </p>
                                    </div>
                                {/if}
                                {#if spell.atHigherLevels}
                                    <p><strong>At higher levels:</strong> {spell.atHigherLevels}</p>
                                {/if}
                                <p>{spell.source} p{spell.page}</p>

                                <label class="label">
                                    <span class="label-text">Notes - will appear on spell card</span>
                                    <textarea class="input preset-tonal min-h-24" rows="3"
                                              placeholder="Example: 'My ring doubles the range' or 'This feat allows me to ignore components'"
                                              oninput={(event) => handleNoteInput(spell.id, event)}>{getNote(character.spellNotes, spell.id)}</textarea>
                                </label>

                                <p class="preset-typo-caption font-semibold uppercase tracking-wider">Preparation</p>

                                <div class="flex flex-col gap-2">
                                    {#if getSelectionMode(spell.id) === "none"}
                                        <button class="btn preset-filled-primary-500" onclick={() => toggleSelectionMode(spell.id, "prepared")}>
                                            Prepare {spell.name}
                                        </button>
                                        <button class="btn preset-tonal" onclick={() => toggleSelectionMode(spell.id, "always")}>
                                            Mark as Always Prepared
                                        </button>
                                    {:else if getSelectionMode(spell.id) === "prepared"}
                                        <button class="btn preset-filled-primary-500" onclick={() => toggleSelectionMode(spell.id, "prepared")}>
                                            Prepared
                                            <CircleCheckBig size={20}/>
                                        </button>
                                    {:else}
                                        <button class="btn preset-filled-secondary-500" onclick={() => toggleSelectionMode(spell.id, "always")}>
                                            Remove Always Prepared
                                            <Star/>
                                        </button>
                                    {/if}
                                </div>

                                <div class="space-y-3 border-t border-surface-300-700/40 pt-4">
                                    <div>
                                        <p class="preset-typo-caption font-semibold uppercase tracking-wider">Free casts</p>
                                        <p class="mt-1 text-sm opacity-80">
                                            Bonus uses that do not spend spell slots (items, features, Metamagic, etc.). Set how many refresh on each rest.
                                        </p>
                                    </div>
                                    <div class="grid gap-3 sm:grid-cols-2">
                                        <div class="card preset-tonal p-3 space-y-3">
                                            <div>
                                                <p class="font-semibold">Per long rest</p>
                                                <p class="text-xs opacity-70">Resets after a long rest</p>
                                            </div>
                                            <div class="flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    class="btn preset-tonal shrink-0"
                                                    aria-label="Decrease free casts per long rest"
                                                    onclick={() => stepCount("long", spell.id, -1)}
                                                >
                                                    <CircleMinus size={20}/>
                                                </button>
                                                <span class="min-w-[2.5ch] text-center text-2xl font-bold tabular-nums">
                                                    {getCount(character.freePerLongRestSpells, spell.id)}
                                                </span>
                                                <button
                                                    type="button"
                                                    class="btn preset-filled-primary-500 shrink-0"
                                                    aria-label="Increase free casts per long rest"
                                                    onclick={() => stepCount("long", spell.id, 1)}
                                                >
                                                    <CirclePlus size={20}/>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="card preset-tonal p-3 space-y-3">
                                            <div>
                                                <p class="font-semibold">Per short rest</p>
                                                <p class="text-xs opacity-70">Resets after a short rest</p>
                                            </div>
                                            <div class="flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    class="btn preset-tonal shrink-0"
                                                    aria-label="Decrease free casts per short rest"
                                                    onclick={() => stepCount("short", spell.id, -1)}
                                                >
                                                    <CircleMinus size={20}/>
                                                </button>
                                                <span class="min-w-[2.5ch] text-center text-2xl font-bold tabular-nums">
                                                    {getCount(character.freePerShortRestSpells, spell.id)}
                                                </span>
                                                <button
                                                    type="button"
                                                    class="btn preset-filled-primary-500 shrink-0"
                                                    aria-label="Increase free casts per short rest"
                                                    onclick={() => stepCount("short", spell.id, 1)}
                                                >
                                                    <CirclePlus size={20}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/snippet}
                </Accordion.ItemContent>
            </Accordion.Item>
        {/each}
    </Accordion>
</div>
