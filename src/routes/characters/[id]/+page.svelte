<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import {Accordion} from '@skeletonlabs/skeleton-svelte';
    import {formatSpellLevel, formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {slide} from "svelte/transition";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {SPELL_LEVELS} from "$lib/utils/constants";
    import type {Spell} from "$lib/types/spell";
    import type {SpellSlot} from "$lib/types/spellSlot";
    import CharacterCard from "$lib/components/CharacterCard.svelte";
    import {ArrowLeft, ArrowRight, Brain, CircleCheckBig, FlameKindling, Heart, RotateCcw, SquarePen, Sun, Zap, Circle} from "@lucide/svelte";
    import type {Character} from "$lib/types/character";

    const {data} = $props();
    let character: Character = $derived.by(() => app.current.characters.find((c: any) => c.id === data.characterId));

    let selectedLevels = $state<number[]>([]);
    let selectedCastingTimes = $state<string[]>([]);
    let requireRitual = $state(false);
    let concentrationMode = $state<"both" | "conc" | "no-conc">("both");

    let openSpellId = $state<string[]>([]);

    let spells = app.current.spells?.filter((s: Spell) => character.spellIds?.includes(s.id)).sort((a: Spell, b: Spell) => a.level - b.level);
    let filteredSpells = $state<Spell[]>(spells);

    $effect(() => {
        if (!spells) return [];
        filteredSpells = spells.filter((spell: Spell) => {
            if (selectedLevels.length && !selectedLevels.includes(spell.level)) return false;
            if (selectedCastingTimes.length && !selectedCastingTimes.some(time => spell.castingTime.includes(time))) return false;
            if (requireRitual && !spell.school.includes("(ritual)")) return false;
            if (concentrationMode === "conc" && !spell.duration.includes("Concentration")) return false;
            if (concentrationMode === "no-conc" && spell.duration.includes("Concentration")) return false;
            return true;
        });
    });

    function goBack() {
        history.back();
    }

    function toggleLevel(level: number) {
        if (selectedLevels.includes(level)) {
            selectedLevels = selectedLevels.filter(value => value !== level);
            return;
        }
        selectedLevels = [...selectedLevels, level];
    }

    function toggleCastingTime(time: string) {
        if (selectedCastingTimes.includes(time)) {
            selectedCastingTimes = selectedCastingTimes.filter(value => value !== time);
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
        character.spellSlots.forEach((slot: SpellSlot) => slot.used = 0);
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
        const slot = character.spellSlots.find((s: SpellSlot) => s.level === spell.level);
        if (!slot || slot.used >= slot.total) return;
        slot.used += 1;
    }

    function undoCast(spell: Spell) {
        const slot = character.spellSlots.find((s: SpellSlot) => s.level === spell.level);
        if (!slot) return;
        slot.used -= 1;
    }

    function togglePrepared(spell: Spell) {
        const index = character.preparedSpellIds?.findIndex((id: string) => id === spell.id);
        if (index === -1) {
            character.preparedSpellIds = [...(character.preparedSpellIds ?? []), spell.id];
        } else {
            character.preparedSpellIds = character.preparedSpellIds?.filter((id: string) => id !== spell.id);
        }
    }
</script>

<div class="space-y-4">
    <div class="flex justify-between gap-2">
        <button class="flex gap-2 items-center" onclick={goBack}>
            <ArrowLeft/>
            Back
        </button>
        <a href={`/characters/${character.id}/edit`} class="flex gap-2 items-center">Edit
            <ArrowRight/>
        </a>
    </div>

    <CharacterCard character={character}/>

    <div class="card preset-filled-surface-100-900 p-4 space-y-4">
        <SectionHeader title="Spell Slots" subtitle={`Use and restore spell slots`}/>
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
                                <span class="h-8 w-8 badge rounded-full font-bold text-xl"
                                      style={`filter: hue-rotate(${(slot.level)*12}deg)`}
                                      class:preset-filled-primary-500={i >= slot.used}
                                      class:preset-filled-surface-500={i < slot.used}
                                      class:opacity-50={i < slot.used}>
                                    {slot.total - i }
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

        <div class="flex justify-end gap-2">
            <a href={`/characters/${character.id}/edit`} class="btn preset-filled">Edit Slots
                <SquarePen/>
            </a>
            <button class="btn grow preset-filled-primary-200-800" onclick={longRest}>Long Rest
                <Sun/>
            </button>
        </div>
    </div>

    <div class="card preset-filled-surface-100-900 p-4 space-y-4">

        <SectionHeader title="Quick Filters" subtitle={`Use the filters to quickly find what you need.`}/>
        <div class="space-y-1">
            <div class="flex flex-wrap gap-1">
                <button
                        class="btn grow"
                        class:preset-filled-tertiary-200-800={selectedLevels.includes(0)}
                        class:preset-tonal={!selectedLevels.includes(0)}
                        onclick={() => toggleLevel(0)}>
                    Cantrips
                </button>
                {#each SPELL_LEVELS.filter(level => character.spellSlots.filter(slot => slot.total > 0).some(slot => slot.level === level)) as spellLevel}
                    <button class="btn grow"
                            class:preset-filled-tertiary-200-800={selectedLevels.includes(spellLevel)}
                            class:preset-tonal={!selectedLevels.includes(spellLevel)}
                            onclick={() => toggleLevel(spellLevel)}>
                        {formatSpellLevel(spellLevel)}
                    </button>
                {/each}
            </div>
            <div class="flex flex-row gap-1">
                <button class="btn basis-1/3"
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("Action")}
                        class:preset-tonal={!selectedCastingTimes.includes("Action")}
                        onclick={() => toggleCastingTime("Action")}>
                    Action
                </button>
                <button class="btn basis-1/3"
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("Bonus")}
                        class:preset-tonal={!selectedCastingTimes.includes("Bonus")}
                        onclick={() => toggleCastingTime("Bonus")}>
                    Bonus
                </button>
                <button class="btn basis-1/3"
                        class:preset-filled-primary-200-800={selectedCastingTimes.includes("Reaction")}
                        class:preset-tonal={!selectedCastingTimes.includes("Reaction")}
                        onclick={() => toggleCastingTime("Reaction")}>
                    Reaction
                </button>
                <button class="btn basis-1/3"
                        class:preset-filled-primary-200-800={requireRitual}
                        class:preset-tonal={!requireRitual}
                        onclick={toggleRituals}>
                    Rit.
                </button>
            </div>
            <div class="flex flex-row gap-1">
                <button class="btn basis-1/3"
                        class:preset-filled-secondary-200-800={concentrationMode === "conc"}
                        class:preset-tonal={concentrationMode !== "conc"}
                        onclick={() => setConcentrationMode("conc")}>
                    Conc.
                </button>
                <button class="btn basis-1/3 preset-tonal"
                        onclick={() => setConcentrationMode("both")}>
                    Both
                </button>
                <button class="btn basis-1/3"
                        class:preset-filled-secondary-200-800={concentrationMode === "no-conc"}
                        class:preset-tonal={concentrationMode !== "no-conc"}
                        onclick={() => setConcentrationMode("no-conc")}>
                    No Conc.
                </button>
            </div>
            <button class="btn w-full preset-tonal" onclick={resetFilters}>Reset Filters
                <RotateCcw size="20"/>
            </button>
        </div>
    </div>

    <SectionHeader title={`Spells (${spells.length})`} subtitle={`These are the spell currently known to ${character.name}.`}/>
    <Accordion collapsible value={openSpellId} onValueChange={(details) => (openSpellId = details.value)}>
        {#each filteredSpells as s (s.name)}
            <Accordion.Item value={s.id} class="preset-tonal border-l-4 border-l-primary-500 rounded-r-2xl" style={`filter: hue-rotate(${(s.level)*90}deg)`}>
                <Accordion.ItemTrigger class="font-bold flex justify-between">
                    <div class="flex gap-4 items-center">
                        {formatSpellLevelLong(s.level)}
                        {#if character.preparedSpellIds?.includes(s.id)}
                            <CircleCheckBig/>
                        {/if}
                        {#if s.duration.includes("Concentration")}
                            <Brain/>
                        {/if}
                        {#if s.school.includes("(ritual)")}
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
                            {@const slot = character.spellSlots.find(slot => slot.level === s.level)}
                            {@const remaining = (slot?.total ?? 0) - (slot?.used ?? 0)}
                            {@const total = slot?.total ?? 0}
                            <div {...attributes} class="space-y-4 p-4 card preset-filled-surface-100-900" transition:slide={{ duration: 300 }}>
                                <p class="preset-typo-headline tracking-wide">{s.name}</p>
                                <div>
                                    <p><strong>School:</strong> {s.school}</p>
                                    <p><strong>Casting time:</strong> {s.castingTime}</p>
                                    <p><strong>Range:</strong> {s.range}</p>
                                    <p><strong>Duration:</strong> {s.duration}</p>
                                    <p><strong>Components:</strong> {s.components}</p>
                                </div>
                                <div>
                                    <i>{s.text}</i>
                                </div>
                                {#if s.atHigherLevels}
                                    <p><strong>At higher levels:</strong> {s.atHigherLevels}</p>
                                {/if}
                                <p>{s.source} p{s.page}</p>
                                {#if s.level !== 0}
                                    <div class="flex flex-wrap justify-between gap-2">
                                        <button class="btn grow" onclick={() => togglePrepared(s)}
                                                class:preset-filled-primary-500={character.preparedSpellIds?.includes(s.id)}
                                                class:preset-tonal-surface={!character.preparedSpellIds?.includes(s.id)}>
                                            {#snippet preparedStatus()}
                                                ({character.preparedSpellIds?.length ?? 0}/{character.preparedLimit})
                                            {/snippet}
                                            {#if character.preparedSpellIds?.includes(s.id)}
                                                Prepared
                                                <CircleCheckBig/>
                                                {@render preparedStatus()}
                                            {:else}
                                                Prepare
                                                <Circle/>
                                                {@render preparedStatus()}
                                            {/if}
                                        </button>
                                        <button class="btn grow" onclick={() => undoCast(s)}
                                                class:preset-tonal-primary={remaining !== total}
                                                class:preset-tonal-surface={remaining === total}
                                                class:disabled={remaining === total}
                                                disabled={remaining === total}>
                                            Restore Slot
                                        </button>
                                        <button class="btn grow transition-all duration-500" onclick={() => castSpell(s)}
                                                class:preset-filled-primary-500={remaining > 0}
                                                class:preset-filled-surface-500={remaining === 0}
                                                class:disabled={remaining === 0}
                                                disabled={remaining === 0}>
                                            Cast as {s.castingTime} at {formatSpellLevel(s.level)} ({remaining}/{total})
                                        </button>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    {/snippet}
                </Accordion.ItemContent>
            </Accordion.Item>
        {/each}
        <div class="space-y-2">
            {#each spells.slice(0, spells.length - filteredSpells.length) as _}
                <div class="h-8"></div>
            {/each}
        </div>
    </Accordion>
</div>
