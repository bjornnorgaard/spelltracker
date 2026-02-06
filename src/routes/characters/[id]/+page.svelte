<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import {Accordion} from '@skeletonlabs/skeleton-svelte';
    import {formatSpellLevel, formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {fly, slide} from "svelte/transition";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {SPELL_LEVELS} from "$lib/utils/constants";
    import {flip} from "svelte/animate";

    const {data} = $props();

    let spells = app.current.spells?.filter(s => data.character.spells?.includes(s.id)).sort((a, b) => a.level - b.level);
    let filteredSpells = $state(spells);

    function filterSpellLevel(level: number) {
        filteredSpells = spells?.filter(s => s.level === level);
    }

    function filterRituals() {
        filteredSpells = spells?.filter(s => s.school.includes("(ritual)"));
    }

    function filterAction() {
        filteredSpells = spells?.filter(s => !s.castingTime.includes("Action"));
    }

    function filterBonus() {
        filteredSpells = spells?.filter(s => s.castingTime.includes("Bonus"));
    }

    function filterReaction() {
        filteredSpells = spells?.filter(s => s.castingTime.includes("Reaction"));
    }

    function filterConcentration() {
        filteredSpells = spells?.filter(s => s.duration.includes("Concentration"));
    }

    function filterAll() {
        filteredSpells = app.current.spells;
    }

    function useSlot(level: number) {
        const slot = data.character.spellSlots.find(s => s.level === level);
        if (!slot || slot.used >= slot.total) return;
        slot.used += 1;
    }

    function restoreSlot(level: number) {
        const slot = data.character.spellSlots.find(s => s.level === level);
        if (!slot || slot.used <= 0) return;
        slot.used -= 1;
    }
</script>

<div class="space-y-4">
    <PageHeader title={data.character.name} subtitle={`Your ${data.character.level}th level ${data.character.class}. Here you can view ${data.character.name}'s spells and spell slots.`}/>
    <a href={`/characters/${data.character.id}/edit`} class="btn preset-filled-primary-200-800">Edit {data.character.name}
        →</a>

    <SectionHeader title="Spell Slots" subtitle={`View and use ${data.character.name}'s spell slots. Use the edit link to change totals or add spell slots for higher levels.`}/>
    <div class="flex gap-2 justify-between">
        {#each data.character.spellSlots as slot (slot.level)}
            {#if slot.total > 0}
                <div class="">
                    <div class="flex items-center justify-between">
                        <p class="text-base font-semibold">{formatSpellLevel(slot.level)}</p>
                    </div>
                    <div class="mt-2 flex flex-col items-center gap-2">
                        <button class="btn h-7 w-7 p-0 text-xs preset-filled-primary-200-800" onclick={() => useSlot(slot.level)} disabled={slot.used >= slot.total}>
                            U
                        </button>
                        {#each Array(slot.total) as _, i (i)}
                                <span class="h-8 w-8 badge rounded-full"
                                      class:preset-filled-primary-500={i >= slot.used}
                                      class:preset-filled-surface-500={i < slot.used}
                                      class:opacity-50={i < slot.used}>
                                    {i + 1}
                                </span>
                        {/each}
                        <button class="btn h-7 w-7 p-0 text-xs preset-filled-surface-200-800" onclick={() => restoreSlot(slot.level)} disabled={slot.used <= 0}>
                            R
                        </button>
                    </div>
                </div>
            {/if}
        {/each}
    </div>

    <SectionHeader title={`Spells (${spells.length})`}
                   subtitle={`These are the spell currently known to ${data.character.name}. Use the filters to quickly find what you need.`}/>
    <div class="space-y-1">
        <div class="flex flex-wrap gap-1">
            <button class="btn grow preset-filled-tertiary-200-800" onclick={() => filterSpellLevel(0)}>
                Cantrips
            </button>
            {#each SPELL_LEVELS.filter(level => data.character.spellSlots.filter(slot => slot.total > 0).some(slot => slot.level === level)) as spellLevel}
                <button class="btn grow preset-filled-tertiary-200-800"
                        onclick={() => filterSpellLevel(spellLevel)}>{formatSpellLevel(spellLevel)}
                </button>
            {/each}
        </div>
        <div class="flex flex-row gap-1">
            <button class="btn basis-1/3 preset-filled-primary-200-800" onclick={filterAction}>Action</button>
            <button class="btn basis-1/3 preset-filled-primary-200-800" onclick={filterBonus}>Bonus</button>
            <button class="btn basis-1/3 preset-filled-primary-200-800" onclick={filterReaction}>Reaction</button>
        </div>
        <div class="flex flex-row gap-1">
            <button class="btn basis-1/2 preset-filled-secondary-200-800" onclick={filterRituals}>Ritual</button>
            <button class="btn basis-1/2 preset-filled-secondary-200-800" onclick={filterConcentration}>Concentration
            </button>
        </div>
        <button class="btn w-full preset-filled-surface-200-800" onclick={filterAll}>Reset Filters</button>
    </div>

    <Accordion collapsible>
        {#each filteredSpells as s (s.id)}
            <div animate:flip={{duration: 300}} in:fly={{x: 1000}} out:fly={{x: -1000}}>
                <Accordion.Item value={s.id} class="card preset-tonal">
                    <Accordion.ItemTrigger class="font-bold flex justify-between gap-2">
                        <Accordion.ItemIndicator class="group w-full">
                            <div class="flex justify-between">
                                <p>{formatSpellLevelLong(s.level)}</p>
                                <p class="flex gap-2">
                                    {s.name}
                                    {#if s.school.includes("(ritual)")}
                                        <span class="chip rounded-full preset-filled-surface-300-700">R</span>
                                    {/if}
                                </p>
                            </div>
                        </Accordion.ItemIndicator>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        {#snippet element(attributes)}
                            {#if !attributes.hidden}
                                <div {...attributes} class="space-y-4 card preset-filled-primary-50-950"
                                     transition:slide={{ duration: 300 }}>
                                    <div>
                                        <p><strong>School:</strong> {s.school}</p>
                                        <p><strong>Casting time:</strong> {s.castingTime}</p>
                                        <p><strong>Range:</strong> {s.range}</p>
                                        <p><strong>Duration:</strong> {s.duration}</p>
                                        <p><strong>Components:</strong> {s.components}</p>
                                    </div>
                                    <div>
                                        <p>{s.text}</p>
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
            </div>
        {/each}
    </Accordion>

</div>
