<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import {Accordion} from '@skeletonlabs/skeleton-svelte';
    import {formatSpellLevel, formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {slide} from "svelte/transition";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {SPELL_LEVELS} from "$lib/utils/constants";
    import type {Spell} from "$lib/types/spell";
    import type {SpellSlot} from "$lib/types/spellSlot";
    import type {SpellEvent} from "$lib/types/spellEvent";

    const {data} = $props();

    let selectedLevels = $state<number[]>([]);
    let selectedCastingTimes = $state<string[]>([]);
    let requireRitual = $state(false);
    let concentrationMode = $state<"both" | "conc" | "no-conc">("both");

    let spells = app.current.spells?.filter((s: Spell) => data.character.spells?.includes(s.id)).sort((a: Spell, b: Spell) => a.level - b.level);
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
        data.character.spellSlots.forEach((slot: SpellSlot) => slot.used = 0);
        logEvent("Long Rest");
    }

    function useSlot(level: number) {
        const slot = data.character.spellSlots.find((s: SpellSlot) => s.level === level);
        if (!slot || slot.used >= slot.total) return;
        logEvent(`Use ${formatSpellLevel(level)} slot`);
        slot.used += 1;
    }

    function restoreSlot(level: number) {
        const slot = data.character.spellSlots.find((s: SpellSlot) => s.level === level);
        if (!slot || slot.used <= 0) return;
        logEvent(`Restore ${formatSpellLevel(level)} slot`);
        slot.used -= 1;
    }

    function castSpell(spell: Spell) {
        const slot = data.character.spellSlots.find((s: SpellSlot) => s.level === spell.level);
        if (!slot || slot.used >= slot.total) return;
        logEvent(`Cast ${spell.name} at ${formatSpellLevel(spell.level)}`);
        slot.used += 1;
    }

    function undoCast(spell: Spell) {
        const slot = data.character.spellSlots.find((s: SpellSlot) => s.level === spell.level);
        if (!slot) return;
        logEvent(`Undo ${formatSpellLevelLong(spell.level)} ${spell.name}`);
        slot.used -= 1;
    }

    function logEvent(s: string) {
        const e: SpellEvent = {text: s, timestamp: new Date()};
        data.character.spellEvents.push(e);
    }
</script>

<div class="space-y-4">
    <PageHeader title={data.character.name} subtitle={`Your ${data.character.level}th level ${data.character.class}. Here you can view ${data.character.name}'s spells and spell slots.`}/>
    <div class="flex justify-between gap-2">
        <a href={`/`} class="btn preset-tonal">⬅ Home</a>
        <button class="btn grow preset-filled-primary-200-800" onclick={longRest}>Long Rest</button>
        <a href={`/characters/${data.character.id}/edit`} class="btn preset-tonal">Edit<span class="rotate-180">⬅</span></a>
    </div>

    <SectionHeader title="Spell Slots" subtitle={`View and use ${data.character.name}'s spell slots. Use the edit link to change totals or add spell slots for higher levels.`}/>
    <div class="flex  gap-2">
        {#each data.character.spellSlots as slot (slot.level)}
            {#if slot.total > 0}
                <div>
                    <div class="flex items-center justify-between">
                        <p class="text-base font-semibold">{formatSpellLevel(slot.level)}</p>
                    </div>
                    <div class="mt-2 flex flex-col-reverse items-center gap-2">
                        <button class="btn h-8 w-8 rounded-full mb-1 p-0 text-xs preset-filled-primary-200-800" onclick={() => useSlot(slot.level)} disabled={slot.used >= slot.total}>
                            Use
                        </button>
                        {#each Array(slot.total) as _, i (i)}
                                <span class="h-8 w-8 badge rounded-full font-bold text-xl"
                                      style={`filter: hue-rotate(${(slot.level+1)*10}deg)`}
                                      class:preset-filled-primary-500={i >= slot.used}
                                      class:preset-filled-surface-500={i < slot.used}
                                      class:opacity-50={i < slot.used}>
                                    {slot.total - i }
                                </span>
                        {/each}
                        <button class="btn rounded-full h-8 w-8 mt-1 p-0 text-xs preset-filled-surface-200-800" onclick={() => restoreSlot(slot.level)} disabled={slot.used <= 0}>
                            Res
                        </button>
                    </div>
                </div>
            {/if}
        {/each}
    </div>

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
            {#each SPELL_LEVELS.filter(level => data.character.spellSlots.filter(slot => slot.total > 0).some(slot => slot.level === level)) as spellLevel}
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
                Ritual
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
        <button class="btn w-full preset-filled-surface-200-800" onclick={resetFilters}>Reset Filters</button>
    </div>

    <SectionHeader title={`Spells (${spells.length})`} subtitle={`These are the spell currently known to ${data.character.name}.`}/>
    <Accordion collapsible>
        {#each filteredSpells as s (s.name)}
            <Accordion.Item value={s.id} class="card preset-tonal border-2 border-surface-200-800">
                <Accordion.ItemTrigger class="font-bold flex justify-between">
                    <div class="flex gap-2 items-center">
                        {formatSpellLevelLong(s.level)}
                        {#if s.duration.includes("Concentration")}
                            <span class="badge rounded-full preset-filled-secondary-100-900">C</span>
                        {/if}
                        {#if s.school.includes("(ritual)")}
                            <span class="badge rounded-full preset-filled-primary-100-900">R</span>
                        {/if}
                    </div>
                    <Accordion.ItemIndicator class="group">
                        {s.name}
                    </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                    {#snippet element(attributes)}
                        {#if !attributes.hidden}
                            {@const slot = data.character.spellSlots.find(slot => slot.level === s.level)}
                            {@const remaining = (slot.total ?? 0) - (slot.used ?? 0)}
                            {@const total = slot.total ?? 0}
                            <div {...attributes} class="space-y-4 card preset-filled-surface-100-900" transition:slide={{ duration: 300 }}>
                                {#if s.level !== 0}
                                    <div class="flex justify-between gap-2">
                                        <button class="btn w-full transition-all duration-500" onclick={() => castSpell(s)}
                                                class:preset-filled-primary-500={remaining > 0}
                                                class:preset-filled-surface-500={remaining === 0}
                                                class:disabled={remaining === 0}
                                                disabled={remaining === 0}>
                                            Cast as {s.castingTime} at {formatSpellLevel(s.level)} ({remaining}/{total})
                                        </button>
                                        <button class="btn" onclick={() => undoCast(s)}
                                                class:preset-tonal-primary={remaining !== total}
                                                class:preset-tonal-surface={remaining === total}
                                                class:disabled={remaining === total}
                                                disabled={remaining === total}>
                                            Undo
                                        </button>
                                    </div>
                                {/if}
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
                            </div>
                        {/if}
                    {/snippet}
                </Accordion.ItemContent>
            </Accordion.Item>
        {/each}
    </Accordion>
</div>
