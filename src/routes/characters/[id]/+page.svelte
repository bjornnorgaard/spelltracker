<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import {Accordion} from '@skeletonlabs/skeleton-svelte';
    import {formatSpellLevelLong} from "$lib/utils/spell-formatter";

    const {data} = $props();

    let spells = app.current.spells.filter(s => data.character.spells.includes(s.id)).sort((a, b) => a.level - b.level);
</script>

<div class="space-y-4">
    <h3 class="h3">{data.character.name}</h3>
    <div>
        <span class="badge preset-filled">{data.character.class}</span>
        <span class="badge preset-filled">{data.character.level}th level</span>
    </div>

    <h3 class="h3">Spells</h3>

    <Accordion multiple>
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
                    <div class="space-y-4">
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
                </Accordion.ItemContent>
            </Accordion.Item>
        {/each}
    </Accordion>

</div>
