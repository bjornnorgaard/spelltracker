<script lang="ts">
    import {DND_CLASSES} from "$lib/utils/constants";
    import {characters, spells} from "$lib/stores/stores";
    import {formatSpellLevel} from "$lib/utils/spell-formatter";
    import type {Character} from "$lib/types/character";
    import Section from "$lib/components/Section.svelte";
    import {ArrowDown, ArrowUp} from "@lucide/svelte";

    const {data} = $props();
    let character: Character = $derived.by(() => characters.current.find((c: any) => c.id === data.characterId));

    async function deleteCharacter() {
        characters.current = characters.current?.filter((c: any) => c.id !== character.id);
        window.location.href = "/";
    }
</script>

<div class="space-y-8">
    <Section title="Character Info" subtitle="Edit basic character information">
        <label class="label">
            <span class="label-text">Name</span>
            <input type="text" class="input preset-tonal" autocomplete="off" bind:value={character.name} required/>
        </label>
        <label class="label">
            <span class="label-text">Level</span>
            <input type="number" min={1} max={20} class="input preset-tonal" bind:value={character.level} required/>
        </label>
        <label class="label">
            <span class="label-text">Class</span>
            <select class="select preset-tonal" bind:value={character.class} required>
                {#each DND_CLASSES as cla (cla)}
                    <option value={cla}>{cla}</option>
                {/each}
            </select>
        </label>
        <label class="label">
            <span class="label-text">Prepared Spells</span>
            <input type="number" min={1} max={25} class="input preset-tonal" bind:value={character.preparedSpellsLimit} required/>
        </label>
    </Section>

    <Section title="Spell Slots" subtitle="Configure how many spells slots of each level your character has">
        <div class="flex justify-between">
            {#each character.spellSlots.filter(ss => ss.level > 0) as slot}
                <div class="flex gap-2 items-center flex-col" style={`filter: hue-rotate(${slot.level * 12}deg)`}>
                    <span>{formatSpellLevel(slot.level)}</span>
                    <button class="preset-tonal" onclick={() => slot.total++}>
                        <ArrowUp/>
                    </button>
                    <span class="badge preset-filled-primary-500">{slot.total}</span>
                    <button class="preset-tonal" onclick={() => slot.total--}>
                        <ArrowDown/>
                    </button>
                </div>
            {/each}
        </div>
    </Section>

    <Section title="Spellbook" subtitle="Select character spells, prepared spells, always prepared, and free casts.">
        <a href={"/characters/" + data.characterId + "/spells" } class="btn w-full preset-filled-primary-500">Edit Spells</a>
        {#if !character.selectedSpellIds?.length && spells.current?.length}
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

    <Section title="Danger Zone" subtitle="Careful. This will delete all your character data. This action is permanent and cannot be undone">
        <button class="btn preset-filled-error-500" onclick={() => deleteCharacter()}>Delete Character</button>
    </Section>
</div>
