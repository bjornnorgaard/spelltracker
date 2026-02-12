<script lang="ts">
    import {characters, spells as spellsStore} from "$lib/stores/stores";
    import {Accordion} from "@skeletonlabs/skeleton-svelte";
    import {formatSpellLevel, formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {slide} from "svelte/transition";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {SPELL_LEVELS} from "$lib/utils/constants";
    import type {Spell} from "$lib/types/spell";
    import type {SpellSlot} from "$lib/types/spellSlot";
    import type {FreeCastSpell} from "$lib/types/freeCastSpell";
    import CharacterCard from "$lib/components/CharacterCard.svelte";
    import ConcentrationWarningDialog from "$lib/components/ConcentrationWarningDialog.svelte";
    import ConcentrationFloatingAlert from "$lib/components/ConcentrationFloatingAlert.svelte";
    import ConcentrationCard from "$lib/components/ConcentrationCard.svelte";
    import {ArrowLeft, ArrowRight, Brain, FlameKindling, Heart, HeartPlus, RotateCcw, SquarePen, Sun, X, Zap} from "@lucide/svelte";
    import type {Character} from "$lib/types/character";
    import Section from "$lib/components/Section.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";

    const {data} = $props();
    let character: Character = $derived.by(() => characters.current.find((c: any) => c.id === data.characterId));

    let selectedLevels = $state<number[]>([]);
    let selectedCastingTimes = $state<string[]>([]);
    let requireRitual = $state(false);
    let concentrationMode = $state<"both" | "conc" | "no-conc">("both");

    let openSpellId = $state<string[]>([]);

    // Concentration state
    let showConcentrationDialog = $state(false);
    let pendingConcentrationSpell = $state<Spell | null>(null);
    let pendingCastAction = $state<(() => void) | null>(null);

    let spells = $derived.by(() => {
        if (!character) return [];
        const selectedSpellIds = new Set<string>(character.selectedSpellIds ?? []);

        return (spellsStore.current ?? []).filter((spell: Spell) => selectedSpellIds.has(spell.id)).sort((a: Spell, b: Spell) => a.level - b.level);
    });
    let filteredSpells = $derived.by(() => {
        if (!spells) return [];

        return spells.filter((spell: Spell) => {
            if (selectedLevels.length && !selectedLevels.includes(spell.level)) return false;
            if (selectedCastingTimes.length && !selectedCastingTimes.some((time) => spell.castingTime.includes(time))) return false;
            if (requireRitual && !spell.ritual) return false;
            if (concentrationMode === "conc" && !spell.duration.includes("Concentration")) return false;
            if (concentrationMode === "no-conc" && spell.duration.includes("Concentration")) return false;
            return true;
        });
    });

    // Derived concentration spell
    let concentratingSpell = $derived.by(() => {
        if (!character?.concentrationSpellId) return null;
        return spellsStore.current.find((s: Spell) => s.id === character.concentrationSpellId) ?? null;
    });

    function goBack() {
        history.back();
    }

    function toggleLevel(level: number) {
        if (selectedLevels.includes(level)) {
            selectedLevels = selectedLevels.filter((value) => value !== level);
            return;
        }
        selectedLevels = [...selectedLevels, level];
    }

    function toggleCastingTime(time: string) {
        if (selectedCastingTimes.includes(time)) {
            selectedCastingTimes = selectedCastingTimes.filter((value) => value !== time);
            return;
        }
        selectedCastingTimes = [...selectedCastingTimes, time];
    }

    function toggleRituals() {
        requireRitual = !requireRitual;
    }

    function setConcentrationMode(mode: "both" | "conc" | "no-conc") {
        concentrationMode = mode;
    }

    function resetFilters() {
        selectedLevels = [];
        selectedCastingTimes = [];
        requireRitual = false;
        concentrationMode = "both";
    }

    function longRest() {
        character.spellSlots.forEach((slot: SpellSlot) => (slot.used = 0));
        character.freePerLongRestSpells?.forEach((entry: FreeCastSpell) => (entry.used = 0));
        character.freePerShortRestSpells?.forEach((entry: FreeCastSpell) => (entry.used = 0));
        dropConcentration();
    }

    function shortRest() {
        character.freePerShortRestSpells?.forEach((entry: FreeCastSpell) => (entry.used = 0));
    }

    function dropConcentration() {
        character.concentrationSpellId = null;
    }

    function checkConcentrationAndCast(spell: Spell, castAction: () => void) {
        const requiresConcentration = spell.duration.includes("Concentration");

        if (requiresConcentration && character.concentrationSpellId) {
            // Show warning dialog
            pendingConcentrationSpell = spell;
            pendingCastAction = castAction;
            showConcentrationDialog = true;
        } else {
            // Cast directly
            castAction();
            if (requiresConcentration) {
                character.concentrationSpellId = spell.id;
            }
        }
    }

    function confirmConcentrationCast() {
        if (pendingCastAction) {
            pendingCastAction();
            if (pendingConcentrationSpell) {
                character.concentrationSpellId = pendingConcentrationSpell.id;
            }
        }
        showConcentrationDialog = false;
        pendingConcentrationSpell = null;
        pendingCastAction = null;
    }

    function cancelConcentrationCast() {
        showConcentrationDialog = false;
        pendingConcentrationSpell = null;
        pendingCastAction = null;
    }

    function useSlot(level: number) {
        const slot = character.spellSlots.find((s: SpellSlot) => s.level === level);
        if (!slot || slot.used >= slot.total) return;
        slot.used += 1;
    }

    function restoreSlot(level: number) {
        const slot = character.spellSlots.find((s: SpellSlot) => s.level === level);
        if (!slot || slot.used <= 0) return;
        slot.used -= 1;
    }

    function castSpell(spell: Spell) {
        if (spell.level === 0) {
            checkConcentrationAndCast(spell, () => {
            });
        }

        const slot = character.spellSlots.find((s: SpellSlot) => s.level === spell.level);
        if (!slot || slot.used >= slot.total) return;
        checkConcentrationAndCast(spell, () => {
            slot.used += 1;
        });
    }

    function undoCast(spell: Spell) {
        const slot = character.spellSlots.find((s: SpellSlot) => s.level === spell.level);
        if (!slot) return;
        slot.used -= 1;

        // If undoing the concentration spell, drop concentration
        if (character.concentrationSpellId === spell.id) {
            dropConcentration();
        }
    }

    function getFreeCast(list: FreeCastSpell[], spellId: string) {
        return list?.find((entry: FreeCastSpell) => entry.spellId === spellId);
    }

    function getFreeCastCount(list: FreeCastSpell[], spellId: string) {
        return getFreeCast(list, spellId)?.total ?? 0;
    }

    function getFreeCastRemaining(list: FreeCastSpell[], spellId: string) {
        const entry = getFreeCast(list, spellId);
        if (!entry) return 0;
        return Math.max(entry.total - (entry.used ?? 0), 0);
    }

    function castFree(kind: "long" | "short", spellId: string) {
        const list = kind === "long" ? character.freePerLongRestSpells : character.freePerShortRestSpells;
        const entry = getFreeCast(list, spellId);
        if (!entry) return;
        const remaining = getFreeCastRemaining(list, spellId);
        if (remaining <= 0) return;

        const spell = spellsStore.current.find((s: Spell) => s.id === spellId);
        if (!spell) return;

        checkConcentrationAndCast(spell, () => {
            entry.used = (entry.used ?? 0) + 1;
        });
    }

    function undoFree(kind: "long" | "short", spellId: string) {
        const list = kind === "long" ? character.freePerLongRestSpells : character.freePerShortRestSpells;
        const entry = getFreeCast(list, spellId);
        if (!entry) return;
        const used = entry.used ?? 0;
        if (used <= 0) return;
        entry.used = used - 1;

        // If undoing the concentration spell, drop concentration
        if (character.concentrationSpellId === spellId) {
            dropConcentration();
        }
    }

    function getSpellName(spellId: string) {
        return spellsStore.current.find((spell: Spell) => spell.id === spellId)?.name ?? "Unknown spell";
    }
</script>

<ConcentrationFloatingAlert spell={concentratingSpell} ondrop={() => dropConcentration()}/>

<ConcentrationWarningDialog
        bind:open={showConcentrationDialog}
        currentSpell={concentratingSpell}
        newSpell={pendingConcentrationSpell}
        onConfirm={confirmConcentrationCast}
        onCancel={cancelConcentrationCast}/>

<div class="space-y-8">
    <PageHeader title={character.name} subtitle={`Your ${formatSpellLevel(character.level)} level ${character.class}`}/>

    <Section title="Actions" subtitle="Rest and edit your character">
        <div class="flex flex-col gap-2">
            <button onclick={() => (window.location.href = `/characters/${character.id}/edit`)} class="btn preset-tonal">
                Edit Character
                <SquarePen/>
            </button>
            <button class="btn grow preset-tonal" onclick={shortRest}>
                Short Rest
                <RotateCcw/>
            </button>
            <button class="btn grow preset-tonal" onclick={longRest}>
                Long Rest
                <Sun/>
            </button>
        </div>
    </Section>

    <Section title="Spell Slots" subtitle="Use and restore spell slots">
        {#if character.spellSlots.some(ss => ss.total > 0)}
            <div class="flex flex-col gap-2">
                {#each character.spellSlots.filter(s => s.level > 0).filter(s => s.total > 0) as slot}
                    <div class="flex gap-2">
                        <button class="btn-icon preset-tonal-success" onclick={() => restoreSlot(slot.level)}>
                            <HeartPlus/>
                        </button>
                        {#each Array(slot.total) as _, i}
                            <button class="btn-icon grow"
                                    style={`filter: hue-rotate(${slot.level * 12}deg)`}
                                    class:preset-filled-primary-500={i >= slot.used}
                                    class:preset-filled-surface-500={i < slot.used}
                                    class:opacity-50={i < slot.used}>
                                {formatSpellLevel(slot.level)}
                            </button>
                        {/each}
                        <button class="btn-icon preset-tonal-secondary" onclick={() => useSlot(slot.level)}>
                            <Zap/>
                        </button>
                    </div>
                {/each}
            </div>

        {:else}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No Configured Slots</strong>
                <p>You have not created any characters yet.</p>
            </aside>
            <a href={`/characters/${data.characterId}/edit`} class="btn w-full preset-filled-primary-500">Edit Spell Slots</a>
        {/if}
    </Section>

    <Section title="Quick Filters" subtitle="Use the filters to quickly find what you need">
        <div class="space-y-1">
            <div class="flex flex-wrap gap-1">
                <button class="btn grow" class:preset-filled-tertiary-200-800={selectedLevels.includes(0)} class:preset-tonal={!selectedLevels.includes(0)} onclick={() => toggleLevel(0)}>
                    Cantrips
                </button>
                {#each character.spellSlots.filter(ss => ss.total > 0) as slot}
                    <button class="btn grow" onclick={() => toggleLevel(slot.level)}
                            class:preset-filled-tertiary-200-800={selectedLevels.includes(slot.level)}
                            class:preset-tonal={!selectedLevels.includes(slot.level)}>
                        {formatSpellLevel(slot.level)}
                    </button>
                {/each}
            </div>

            <div class="flex flex-row gap-1">
                <button class="btn grow" onclick={() => toggleCastingTime("action")}
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("action")}
                        class:preset-tonal={!selectedCastingTimes.includes("action")}>
                    Action
                </button>
                <button class="btn grow" onclick={() => toggleCastingTime("bonus")}
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("bonus")}
                        class:preset-tonal={!selectedCastingTimes.includes("bonus")}>
                    Bonus
                </button>
                <button class="btn grow" onclick={() => toggleCastingTime("reaction")}
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("reaction")}
                        class:preset-tonal={!selectedCastingTimes.includes("reaction")}>
                    Reaction
                </button>
                <button class="btn grow" onclick={toggleRituals}
                        class:preset-filled-primary-200-800={requireRitual}
                        class:preset-tonal={!requireRitual}>
                    Rit.
                </button>
            </div>

            <div class="flex flex-row gap-1">
                <button class="btn grow" onclick={() => setConcentrationMode("conc")}
                        class:preset-filled-secondary-200-800={concentrationMode === "conc"}
                        class:preset-tonal={concentrationMode !== "conc"}>
                    Conc.
                </button>
                <button class="btn grow preset-tonal" onclick={() => setConcentrationMode("both")}> Both</button>
                <button class="btn grow" onclick={() => setConcentrationMode("no-conc")}
                        class:preset-filled-secondary-200-800={concentrationMode === "no-conc"}
                        class:preset-tonal={concentrationMode !== "no-conc"}>
                    No Conc.
                </button>
            </div>

            <button class="btn w-full preset-tonal" onclick={resetFilters}>
                Reset Filters
                <RotateCcw size="20"/>
            </button>
        </div>
    </Section>

    <Section title="Spellbook" subtitle="View your spellbook">
        <a href={"/characters/" + data.characterId + "/spells" } class="btn w-full preset-filled-primary-500">Edit Spells</a>
        {#if character.selectedSpellIds.length ?? []}
            {#each character.selectedSpellIds as spell}
                <pre>{JSON.stringify(spell, null, 2)}</pre>
            {/each}
        {:else if spells.current?.length ?? []}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No Prepared Spells</strong>
                <p>You have not prepared any spells yet.</p>
            </aside>
        {:else}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No Imported Spells</strong>
                <p>You have not imported any spells yet.</p>
            </aside>
        {/if}
    </Section>
</div>

{#each [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] as _}
    <br>
{/each}

<div class="space-y-4">
    <div class="flex justify-between gap-2">
        <button class="flex gap-2 items-center" onclick={goBack}>
            <ArrowLeft/>
            Back
        </button>
        <button class="flex gap-2 items-center" onclick={() => (window.location.href = `/characters/${character.id}/spells`)}
        >Spellbook
            <ArrowRight/>
        </button>
    </div>

    <CharacterCard {character}/>

    <div class="card preset-filled-surface-100-900 p-4 space-y-4">
        <SectionHeader title="Spell Slots" subtitle="Use and restore spell slots"/>
        <div class="flex gap-2">
            {#each character.spellSlots as slot (slot.level)}
                {#if slot.total > 0}
                    <div>
                        <div class="flex items-center justify-between">
                            <p class="text-base font-semibold">{formatSpellLevel(slot.level)}</p>
                        </div>
                        <div class="mt-2 flex flex-col-reverse items-center gap-2">
                            <button class="btn h-8 w-8 rounded-full mb-1 p-0 text-xs preset-filled-error-100-900" onclick={() => useSlot(slot.level)} disabled={slot.used >= slot.total}>
                                <Zap/>
                            </button>
                            {#each Array(slot.total) as _, i (i)}
                                <span
                                        class="h-8 w-8 badge rounded-full font-bold text-xl"
                                        style={`filter: hue-rotate(${slot.level * 12}deg)`}
                                        class:preset-filled-primary-500={i >= slot.used}
                                        class:preset-filled-surface-500={i < slot.used}
                                        class:opacity-50={i < slot.used}>
                                    {slot.total - i}
                                </span>
                            {/each}
                            <button class="btn rounded-full h-8 w-8 mt-1 p-0 text-xs preset-filled-success-100-900" onclick={() => restoreSlot(slot.level)} disabled={slot.used <= 0}>
                                <Heart/>
                            </button>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>

        {#if character.freePerLongRestSpells?.length || character.freePerShortRestSpells?.length}
            {@const longFree = character.freePerLongRestSpells?.filter((entry) => entry.total > 0) ?? []}
            {@const shortFree = character.freePerShortRestSpells?.filter((entry) => entry.total > 0) ?? []}
            {#if longFree.length || shortFree.length}
                <div class="space-y-4">
                    <SectionHeader title="Free Casts" subtitle="Cast without expending a spell slot"/>
                    {#if longFree.length}
                        <div class="space-y-1">
                            <p class="text-xs uppercase tracking-wide opacity-70">Per Long Rest</p>
                            {#each longFree as entry, i (`${entry.spellId}-${i}`)}
                                <div class="flex items-center justify-between gap-2 text-sm">
                                    <span class="font-semibold">{getSpellName(entry.spellId)}</span>
                                    <span class="badge preset-filled-surface-500">{Math.max(entry.total - (entry.used ?? 0), 0)}/{entry.total} left</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                    {#if shortFree.length}
                        <div class="space-y-1">
                            <p class="text-xs uppercase tracking-wide opacity-70">Short Rest</p>
                            {#each shortFree as entry, i (`${entry.spellId}-${i}`)}
                                <div class="flex items-center justify-between gap-2 text-sm">
                                    <span class="font-semibold">{getSpellName(entry.spellId)}</span>
                                    <span class="badge preset-filled-surface-500">{Math.max(entry.total - (entry.used ?? 0), 0)}/{entry.total} left</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        {/if}

        <div class="flex flex-col justify-end gap-2">
            <button onclick={() => (window.location.href = `/characters/${character.id}/edit`)} class="btn preset-tonal"
            >Edit Character
                <SquarePen/>
            </button>
            <div class="flex gap-2">
                <button class="btn grow preset-filled-primary-200-800" onclick={shortRest}
                >Short Rest
                    <RotateCcw/>
                </button>
                <button class="btn grow preset-filled-primary-200-800" onclick={longRest}
                >Long Rest
                    <Sun/>
                </button>
            </div>
        </div>
    </div>

    <div class="card preset-filled-surface-100-900 p-4 space-y-4">
        <SectionHeader title="Quick Filters" subtitle="Use the filters to quickly find what you need."/>
        <div class="space-y-1">
            <div class="flex flex-wrap gap-1">
                <button class="btn grow" class:preset-filled-tertiary-200-800={selectedLevels.includes(0)} class:preset-tonal={!selectedLevels.includes(0)} onclick={() => toggleLevel(0)}>
                    Cantrips
                </button>
                {#each SPELL_LEVELS.filter((level) => character.spellSlots.filter((slot) => slot.total > 0).some((slot) => slot.level === level)) as spellLevel (spellLevel)}
                    <button
                            class="btn grow"
                            class:preset-filled-tertiary-200-800={selectedLevels.includes(spellLevel)}
                            class:preset-tonal={!selectedLevels.includes(spellLevel)}
                            onclick={() => toggleLevel(spellLevel)}>
                        {formatSpellLevel(spellLevel)}
                    </button>
                {/each}
            </div>
            <div class="flex flex-row gap-1">
                <button
                        class="btn basis-1/3"
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("action")}
                        class:preset-tonal={!selectedCastingTimes.includes("action")}
                        onclick={() => toggleCastingTime("action")}>
                    Action
                </button>
                <button
                        class="btn basis-1/3"
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("bonus")}
                        class:preset-tonal={!selectedCastingTimes.includes("bonus")}
                        onclick={() => toggleCastingTime("bonus")}>
                    Bonus
                </button>
                <button
                        class="btn basis-1/3"
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("reaction")}
                        class:preset-tonal={!selectedCastingTimes.includes("reaction")}
                        onclick={() => toggleCastingTime("reaction")}>
                    Reaction
                </button>
                <button class="btn basis-1/3" class:preset-filled-primary-200-800={requireRitual} class:preset-tonal={!requireRitual} onclick={toggleRituals}> Rit.</button>
            </div>
            <div class="flex flex-row gap-1">
                <button
                        class="btn basis-1/3"
                        class:preset-filled-secondary-200-800={concentrationMode === "conc"}
                        class:preset-tonal={concentrationMode !== "conc"}
                        onclick={() => setConcentrationMode("conc")}>
                    Conc.
                </button>
                <button class="btn basis-1/3 preset-tonal" onclick={() => setConcentrationMode("both")}> Both</button>
                <button
                        class="btn basis-1/3"
                        class:preset-filled-secondary-200-800={concentrationMode === "no-conc"}
                        class:preset-tonal={concentrationMode !== "no-conc"}
                        onclick={() => setConcentrationMode("no-conc")}>
                    No Conc.
                </button>
            </div>
            <button class="btn w-full preset-tonal" onclick={resetFilters}
            >Reset Filters
                <RotateCcw size="20"/>
            </button>
        </div>
    </div>

    <ConcentrationCard spell={concentratingSpell} onDrop={dropConcentration}/>

    <SectionHeader title={`Spells (${spells.length})`} subtitle={`These are the spells selected for ${character.name}.`}/>
    <Accordion collapsible value={openSpellId} onValueChange={(details) => (openSpellId = details.value)}>
        {#each filteredSpells as s (s.id)}
            <Accordion.Item value={s.id} class="preset-tonal border-l-4 border-l-primary-500 rounded-r-2xl" style={`filter: hue-rotate(${s.level * 90}deg)`}>
                <Accordion.ItemTrigger class="font-bold flex justify-between">
                    <div class="flex gap-4 items-center">
                        {formatSpellLevelLong(s.level)}
                        {#if s.duration.includes("Concentration")}
                            <Brain/>
                        {/if}
                        {#if s.ritual}
                            <FlameKindling/>
                        {/if}
                    </div>
                    <Accordion.ItemIndicator class="group">
                        {s.name}
                    </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                    {#snippet element(attributes)}
                        {#if !attributes.hidden}
                            {@const slot = character.spellSlots.find((slot) => slot.level === s.level)}
                            {@const remaining = (slot?.total ?? 0) - (slot?.used ?? 0)}
                            {@const total = slot?.total ?? 0}
                            {@const longRemaining = getFreeCastRemaining(character.freePerLongRestSpells, s.id)}
                            {@const shortRemaining = getFreeCastRemaining(character.freePerShortRestSpells, s.id)}
                            {@const longTotal = getFreeCastCount(character.freePerLongRestSpells, s.id)}
                            {@const shortTotal = getFreeCastCount(character.freePerShortRestSpells, s.id)}
                            <div {...attributes} class="space-y-4 p-4 card preset-filled-surface-100-900" transition:slide={{ duration: 300 }}>
                                <p class="preset-typo-headline tracking-wide">{s.name}</p>
                                <div>
                                    <p><strong>School:</strong> {s.school}</p>
                                    <p><strong>Casting time:</strong> {s.castingTime}</p>
                                    <p><strong>Range:</strong> {s.range}</p>
                                    <p><strong>Duration:</strong> {s.duration}</p>
                                    <p><strong>Components:</strong> {s.components}</p>
                                </div>
                                {#if character.spellNotes.find((n) => n.spellId === s.id)}
                                    {@const note = character.spellNotes.find((n) => n.spellId === s.id)}
                                    <div class="card preset-filled-primary-500 p-4">
                                        <p class="font-bold text-lg">User note</p>
                                        <p>{note?.text}</p>
                                    </div>
                                {/if}
                                <div>
                                    <i>{s.text}</i>
                                </div>
                                {#if s.atHigherLevels}
                                    <p><strong>At higher levels:</strong> {s.atHigherLevels}</p>
                                {/if}
                                <p>{s.source} p{s.page}</p>
                                {#if character.concentrationSpellId === s.id}
                                    <button class="btn w-full preset-filled-error-500" onclick={dropConcentration}>
                                        Drop Concentration
                                        <X/>
                                    </button>
                                {/if}
                                {#if longTotal > 0 || shortTotal > 0}
                                    <div class="flex flex-wrap gap-2">
                                        {#if longTotal > 0}
                                            <div class="flex w-full gap-4">
                                                <button
                                                        class="btn grow"
                                                        onclick={() => castFree("long", s.id)}
                                                        class:preset-filled-primary-500={longRemaining > 0}
                                                        class:preset-filled-surface-500={longRemaining === 0}
                                                        class:disabled={longRemaining === 0}
                                                        disabled={longRemaining === 0}>
                                                    Cast Free (Long {longRemaining}/{longTotal})
                                                </button>
                                                <button
                                                        class="btn"
                                                        onclick={() => undoFree("long", s.id)}
                                                        class:preset-tonal-primary={longRemaining !== longTotal}
                                                        class:preset-tonal-surface={longRemaining === longTotal}
                                                        class:disabled={longRemaining === longTotal}
                                                        disabled={longRemaining === longTotal}>
                                                    Undo
                                                </button>
                                            </div>
                                        {/if}
                                        {#if shortTotal > 0}
                                            <div class="flex w-full gap-4">
                                                <button
                                                        class="btn grow"
                                                        onclick={() => castFree("short", s.id)}
                                                        class:preset-filled-primary-500={shortRemaining > 0}
                                                        class:preset-filled-surface-500={shortRemaining === 0}
                                                        class:disabled={shortRemaining === 0}
                                                        disabled={shortRemaining === 0}>
                                                    Cast Free (Short {shortRemaining}/{shortTotal})
                                                </button>
                                                <button
                                                        class="btn"
                                                        onclick={() => undoFree("short", s.id)}
                                                        class:preset-tonal-primary={shortRemaining !== shortTotal}
                                                        class:preset-tonal-surface={shortRemaining === shortTotal}
                                                        class:disabled={shortRemaining === shortTotal}
                                                        disabled={shortRemaining === shortTotal}>
                                                    Undo Free (Short)
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                {/if}

                                <div class="flex flex-wrap justify-between gap-2">
                                    <div class="flex w-full gap-4">
                                        <button
                                                class="btn grow transition-all duration-500"
                                                onclick={() => castSpell(s)}
                                                class:preset-filled-primary-500={remaining > 0 || s.level === 0}
                                                class:preset-filled-surface-500={remaining === 0 && s.level !== 0}
                                                class:disabled={remaining === 0 && s.level !== 0}
                                                disabled={remaining === 0 && s.level !== 0}>
                                            <span>Cast as {s.castingTime.slice(0, 10)}</span>
                                            <span class:hidden={s.level === 0}>at {formatSpellLevel(s.level)} ({remaining}/{total})</span>
                                        </button>
                                        <button
                                                class="btn"
                                                onclick={() => undoCast(s)}
                                                class:preset-tonal-primary={remaining !== total}
                                                class:preset-tonal-surface={remaining === total}
                                                class:disabled={remaining === total}
                                                disabled={remaining === total}>
                                            Undo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/snippet}
                </Accordion.ItemContent>
            </Accordion.Item>
        {/each}
        <div class="space-y-2">
            {#each spells.slice(0, spells.length - filteredSpells.length) as _, i (i)}
                <div class="h-8"></div>
            {/each}
        </div>
    </Accordion>
</div>
