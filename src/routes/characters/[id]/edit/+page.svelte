<script lang="ts">
    import {DEFAULT_SPELLCASTING_ABILITY, DEFAULT_SPELLCASTING_ABILITY_SCORE, DND_CLASSES, SPELLCASTING_ABILITIES} from "$lib/utils/constants";
    import {characters, spells} from "$lib/stores/stores";
    import {formatSpellLevel} from "$lib/utils/spell-formatter";
    import {calculateSpellSaveDc, getAbilityModifier, getProficiencyBonusForLevel} from "$lib/utils/spell-save-dc";
    import {applyClassResourcePresets} from "$lib/utils/custom-resource-presets";
    import type {Character} from "$lib/types/character";
    import Section from "$lib/components/Section.svelte";
    import {ArrowDown, ArrowUp, Trash2} from "@lucide/svelte";
    import {onMount} from "svelte";

    const {data} = $props();
    let character: Character = $derived.by(() => characters.current.find((c: any) => c.id === data.characterId));

    onMount(() => {
        if (character && !character.spellcastingAbility) {
            character.spellcastingAbility = DEFAULT_SPELLCASTING_ABILITY;
        }

        if (
            character &&
            (!Number.isFinite(character.spellcastingAbilityScore) ||
                character.spellcastingAbilityScore < 1 ||
                character.spellcastingAbilityScore > 30)
        ) {
            character.spellcastingAbilityScore = DEFAULT_SPELLCASTING_ABILITY_SCORE;
        }

        if (character) {
            applyClassResourcePresets(character);
        }
    });

    let proficiencyBonus = $derived(getProficiencyBonusForLevel(character.level));
    let spellcastingAbilityModifier = $derived(getAbilityModifier(character.spellcastingAbilityScore));
    let spellSaveDc = $derived(calculateSpellSaveDc({proficiencyBonus, spellcastingAbilityModifier}));

    function addCustomResource() {
        character.customResources = [
            ...(character.customResources ?? []),
            {id: crypto.randomUUID(), name: "New Resource", current: 0, max: 0},
        ];
    }

    function removeCustomResource(id: string) {
        character.customResources = (character.customResources ?? []).filter((resource) => resource.id !== id);
    }

</script>

<div class="space-y-8">
    <Section title="Character Info" subtitle="Edit basic character information">
        <div class="grid grid-cols-2 gap-4">

            <label class="label min-w-0 col-span-full">
                <span class="label-text">Name</span>
                <input type="text" class="input preset-tonal w-full min-w-0" autocomplete="off" bind:value={character.name} required/>
            </label>

            <label class="label min-w-0">
                <span class="label-text">Level</span>
                <input type="number" min={1} max={20} class="input preset-tonal w-full min-w-0" bind:value={character.level} onchange={() => applyClassResourcePresets(character)} required/>
            </label>

            <label class="label min-w-0">
                <span class="label-text">Class</span>
                <select class="select preset-tonal w-full min-w-0" bind:value={character.class} onchange={() => applyClassResourcePresets(character)} required>
                    {#each DND_CLASSES as cla (cla)}
                        <option value={cla}>{cla}</option>
                    {/each}
                </select>
            </label>

            <label class="label min-w-0">
                <span class="label-text">Spellcasting Ability</span>
                <select class="select preset-tonal w-full min-w-0" bind:value={character.spellcastingAbility} required>
                    {#each SPELLCASTING_ABILITIES as ability (ability)}
                        <option value={ability}>{ability}</option>
                    {/each}
                </select>
            </label>

            <label class="label min-w-0">
                <span class="label-text">Spellcasting Modifier</span>
                <input type="number" min={1} max={30} class="input preset-tonal w-full min-w-0" bind:value={character.spellcastingAbilityScore} required/>
            </label>

            <label class="label min-w-0">
                <span class="label-text">Prepared Spells</span>
                <input type="number" min={1} max={25} class="input preset-tonal w-full min-w-0" bind:value={character.preparedSpellsLimit} required/>
            </label>

            <aside class="card preset-tonal p-4 min-w-0 col-span-full">
                <strong class="text-base">Spell Save DC: {spellSaveDc}</strong>
                <p class="opacity-70 text-sm">8 + proficiency bonus + spellcasting modifier</p>
                <p class="opacity-70 text-sm">8 + {proficiencyBonus} + {spellcastingAbilityModifier} = <span class="font-bold underline">{spellSaveDc}</span></p>
            </aside>
        </div>
        <div class="flex justify-end">
            <a href={"/characters/" + data.characterId + "/danger"} class="hover:anchor opacity-50">Go to Danger Zone</a>
        </div>
    </Section>

    <Section title="Spell Slots" subtitle="Configure how many spells slots of each level your character has">
        <div class="flex justify-center">
            {#each character.spellSlots.filter(ss => ss.level > 0) as slot (slot.level)}
                <div class="flex flex-1 flex-col items-center" style={`filter: hue-rotate(${slot.level * 12}deg)`}>
                    <span>{formatSpellLevel(slot.level)}</span>
                    <button class="preset-tonal" onclick={() => slot.total++}>
                        <ArrowUp/>
                    </button>
                    <span class="badge preset-filled-primary-500 px-2 font-bold text-lg">{slot.total}</span>
                    <button class="preset-tonal" onclick={() => slot.total--}>
                        <ArrowDown/>
                    </button>
                </div>
            {/each}
        </div>
    </Section>

    <Section title="Custom Resources" subtitle="Track class-specific resources. Presets are auto-added from class/level; you can still add your own.">
        <div class="space-y-3">
            {#if !character.customResources?.length}
                <aside class="card preset-tonal p-4">
                    <p>No custom resources yet.</p>
                </aside>
            {:else}
                {#each character.customResources as resource (resource.id)}
                    <div class="card preset-tonal p-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
                        <label class="label min-w-0 sm:min-w-0 sm:flex-1">
                            <span class="label-text">Name</span>
                            <input type="text" class="input preset-tonal w-full min-w-0" bind:value={resource.name}/>
                        </label>
                        <div class="flex min-w-0 flex-1 items-end gap-2 sm:contents">
                            <label class="label min-w-0 flex-1 sm:w-20 sm:flex-none sm:shrink-0">
                                <span class="label-text">Current</span>
                                <input type="number" min={0} class="input preset-tonal w-full min-w-0" bind:value={resource.current}/>
                            </label>
                            <label class="label min-w-0 flex-1 sm:w-20 sm:flex-none sm:shrink-0">
                                <span class="label-text">Max</span>
                                <input type="number" min={0} class="input preset-tonal w-full min-w-0" bind:value={resource.max}/>
                            </label>
                            <button
                                type="button"
                                class="btn-icon preset-tonal ml-auto shrink-0 opacity-60 hover:opacity-100 sm:ml-0"
                                aria-label="Remove Resource"
                                onclick={() => removeCustomResource(resource.id)}
                            >
                                <Trash2 class="size-4"/>
                            </button>
                        </div>
                    </div>
                {/each}
            {/if}
            <button class="btn w-full preset-filled-primary-500" onclick={addCustomResource}>Add custom resource</button>
        </div>
    </Section>

    <Section title="Spellbook" subtitle="Select character spells, prepared spells, always prepared, and free casts.">
        {#if !spells.current?.length}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No Imported Spells</strong>
                <p>You have not imported any spells yet.</p>
            </aside>
            <a href="/spells/import" class="btn w-full preset-filled-primary-500">Import Spells</a>
        {:else if !character.selectedSpellIds.length}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No Prepared Spells</strong>
                <p>You have not prepared any spells yet.</p>
            </aside>
            <a href={"/characters/" + character.id + "/spells"} class="btn w-full preset-filled-primary-500">Prepare Spells</a>
        {:else}
            <a href={"/characters/" + character.id + "/spells"} class="btn w-full preset-filled-primary-500">Prepare Spells</a>
        {/if}
    </Section>
</div>
