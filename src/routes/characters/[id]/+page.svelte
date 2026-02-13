<script lang="ts">
    import {characters, spells} from "$lib/stores/stores";
    import {Accordion} from "@skeletonlabs/skeleton-svelte";
    import {formatSpellLevel, formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {slide} from "svelte/transition";
    import type {Spell} from "$lib/types/spell";
    import type {SpellSlot} from "$lib/types/spellSlot";
    import type {FreeCastSpell} from "$lib/types/freeCastSpell";
    import ConcentrationWarningDialog from "$lib/components/ConcentrationWarningDialog.svelte";
    import ConcentrationFloatingAlert from "$lib/components/ConcentrationFloatingAlert.svelte";
    import {Brain, FlameKindling, HeartPlus, ListTodo, RotateCcw, Sun, UserRoundPen, X, Zap} from "@lucide/svelte";
    import type {Character} from "$lib/types/character";
    import Section from "$lib/components/Section.svelte";

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

    let allSpells = $derived.by(() => {
        if (!character) return [];
        const selectedSpellIds = new Set<string>(character.selectedSpellIds ?? []);
        return (spells.current ?? []).filter((spell: Spell) => selectedSpellIds.has(spell.id)).sort((a: Spell, b: Spell) => a.level - b.level);
    });
    let filteredSpells = $derived.by(() => {
        if (!allSpells) return [];

        return allSpells.filter((spell: Spell) => {
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
        return spells.current.find((s: Spell) => s.id === character.concentrationSpellId) ?? null;
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

        const spell = spells.current.find((s: Spell) => s.id === spellId);
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
        return spells.current.find((spell: Spell) => spell.id === spellId)?.name ?? "Unknown spell";
    }
</script>

<ConcentrationFloatingAlert spell={concentratingSpell} ondrop={() => dropConcentration()}/>

<ConcentrationWarningDialog bind:open={showConcentrationDialog}
                            currentSpell={concentratingSpell} newSpell={pendingConcentrationSpell}
                            onConfirm={confirmConcentrationCast} onCancel={cancelConcentrationCast}/>

<div class="space-y-8">
    <Section title="Actions" subtitle="Rest and edit your character">
        <div class="grid grid-cols-2 gap-2">
            <button onclick={() => (window.location.href = `/characters/${character.id}/edit`)} class="btn preset-tonal flex justify-between">
                Edit Character
                <UserRoundPen size={20}/>
            </button>
            <button class="btn preset-tonal flex justify-between" onclick={shortRest}>
                Short Rest
                <RotateCcw size={20}/>
            </button>
            <a href={"/characters/" + data.characterId + "/spells" } class="btn preset-tonal flex justify-between">
                Edit Spells
                <ListTodo size={20}/>
            </a>
            <button class="btn preset-tonal flex justify-between" onclick={longRest}>
                Long Rest
                <Sun size={20}/>
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

    {#if character.freePerLongRestSpells.length || character.freePerShortRestSpells.length}
        <Section title="Free Casts" subtitle="Spells you can cast without a slot">
            {#if character.freePerLongRestSpells.length}
                <p class="text-xs opacity-75">Free casts per <span class="font-bold uppercase">Long Rest</span></p>
                <div class="flex items-center gap-4">
                    {#each character.freePerLongRestSpells as fs}
                        {@const s = spells.current.find(spell => spell.id === fs.spellId)}
                        <div class="flex justify-between items-center w-full card preset-tonal py-2 px-4">
                            <span>{s.name}</span>
                            <div class="flex gap-2">
                                <div class="flex gap-1 mr-2">
                                    {#each Array(fs.total) as _, i}
                                        <div class="badge w-8 h-8  rounded-full font-bold text-xl"
                                             class:preset-filled-primary-500={i >= fs.used}
                                             class:preset-filled-surface-500={i < fs.used}
                                             class:disabled={i < fs.used}>
                                            {fs.total - (i)}
                                        </div>
                                    {/each}
                                </div>
                                <button class="text-success-900-100" onclick={() => undoFree("long", fs.spellId)}>
                                    <HeartPlus/>
                                </button>
                                <button class="text-secondary-900-100" onclick={() => castFree("long", fs.spellId)}>
                                    <Zap/>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
            {#if character.freePerShortRestSpells.length}
                <p class="text-xs opacity-75">Free casts per <span class="font-bold uppercase">Short Rest</span></p>
                <div class="flex items-center gap-4">
                    {#each character.freePerShortRestSpells as fs}
                        {@const s = spells.current.find(spell => spell.id === fs.spellId)}
                        <div class="flex justify-between items-center w-full card preset-tonal py-2 px-4">
                            <span>{s.name}</span>
                            <div class="flex gap-2">
                                <div class="flex gap-1 mr-2">
                                    {#each Array(fs.total) as _, i}
                                        <div class="badge w-8 h-8  rounded-full font-bold text-xl"
                                             class:preset-filled-primary-500={i >= fs.used}
                                             class:preset-filled-surface-500={i < fs.used}
                                             class:disabled={i < fs.used}>
                                            {fs.total - (i)}
                                        </div>
                                    {/each}
                                </div>
                                <button class="text-success-900-100" onclick={() => undoFree("short", fs.spellId)}>
                                    <HeartPlus/>
                                </button>
                                <button class="text-secondary-900-100" onclick={() => castFree("short", fs.spellId)}>
                                    <Zap/>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </Section>
    {/if}

    <Section title="Spellbook" subtitle="Your currently prepared spells. Use the filters to find what you need.">
        {#if !spells.current?.length}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No imported spells</strong>
                <p>You have not imported any spells yet.</p>
            </aside>
            <a href="/spells/import" class="btn preset-filled-primary-500 w-full">Go Import Spells</a>
        {:else if !character.selectedSpellIds.length}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No prepared spells</strong>
                <p>You have not prepared any spells yet.</p>
            </aside>
            <a href={"/characters/" + data.characterId + "/spells" } class="btn w-full preset-filled-primary-500">Edit Spells</a>
        {:else}
            <div class="space-y-1 card preset-tonal">
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
                    {#each allSpells.slice(0, allSpells.length - filteredSpells.length) as _, i (i)}
                        <div class="h-8"></div>
                    {/each}
                </div>
            </Accordion>

        {/if}
    </Section>
</div>
