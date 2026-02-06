<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import {Accordion} from '@skeletonlabs/skeleton-svelte';
    import {formatSpellLevel, formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {slide} from "svelte/transition";

    const {data} = $props();

    let spells = app.current.spells.filter(s => data.character.spells.includes(s.id)).sort((a, b) => a.level - b.level);
</script>

<div class="space-y-4">
    <h3 class="h3">{data.character.name}</h3>
    <div>
        <span class="badge preset-filled">{data.character.class}</span>
        <span class="badge preset-filled">{data.character.level}th level</span>
    </div>

    <h3 class="h3">Spell Slots</h3>
    <div class="flex gap-4">
        {#each data.character.spellSlots as slot}
            {#if slot.total > 0}
                <div class="flex flex-col">
                    <span>{formatSpellLevel(slot.level)}</span>
                    <span class="rounded-full text-center preset-filled-primary-500">{slot.total - slot.used}</span>
                </div>
            {/if}
        {/each}
    </div>

    <h3 class="h3">Spells</h3>

    <Accordion collapsible>
        {#each spells as s}
            <Accordion.Item value={s.id} class="card preset-tonal">
                <Accordion.ItemTrigger class="font-bold flex justify-between gap-2">
                    <Accordion.ItemIndicator class="group w-full">
                        <div class="flex justify-between">
                            <p>{formatSpellLevelLong(s.level)}</p>
                            <p>{s.name}</p>
                        </div>
                    </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                    {#snippet element(attributes)}
                        {#if !attributes.hidden}
                            <div {...attributes} class="space-y-4 card preset-filled-primary-50-950" transition:slide={{ duration: 300 }}>
                                <div>
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
        {/each}
    </Accordion>

</div>
