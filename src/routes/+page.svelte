<script lang="ts">
    import {characters, spells} from "$lib/stores/stores";
    import {createCharacter} from "$lib/utils/createCharacter";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import CharacterCard from "$lib/components/CharacterCard.svelte";
    import Section from "$lib/components/Section.svelte";

    function createNewCharacter() {
        const character = createCharacter();
        characters.current.push(character);
        window.location.href = `/characters/${character.id}/edit`;
    }
</script>

<div class="space-y-8">
    <Section title="Your Characters" subtitle="Here are your characters.">
        {#if characters.current.length}
            {#each characters.current as c, i (c.id)}
                <CharacterCard character={c} index={i} showLink={true}/>
            {/each}
        {:else}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No characters</strong>
                <p>You have not created any characters yet.</p>
            </aside>
        {/if}
        <button onclick={createNewCharacter} class="btn w-full preset-filled-primary-500">Create Character</button>
    </Section>

    <Section title="Spells" subtitle="Here are your spells.">
        {#if spells.current.length}
            <div class="grid grid-cols-2 card preset-tonal p-4">
                <span>Total Spells</span> <p class="text-right font-bold">{spells.current.length}</p>
            </div>
        {:else}
            <aside class="card preset-filled-warning-500 p-4">
                <strong class="text-xl">No spells</strong>
                <p>You have not imported any spells yet. Use the button below to import some.</p>
            </aside>
        {/if}
        <a href="/spells/import" class="btn w-full preset-filled-primary-500">Import Spells</a>
    </Section>
</div>
