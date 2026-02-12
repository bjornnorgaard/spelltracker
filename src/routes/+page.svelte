<script lang="ts">
    import { characters, spells } from "$lib/stores/stores";
    import { createCharacter } from "$lib/utils/createCharacter";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import CharacterCard from "$lib/components/CharacterCard.svelte";

    function createNewCharacter() {
        const character = createCharacter();
        characters.current.push(character);
        window.location.href = `/characters/${character.id}/edit`;
    }
</script>

<div class="space-y-4">
    <SectionHeader title="Your Characters" subtitle="Here are your characters." />
    <div class="grid grid-cols-1 gap-4">
        {#each characters.current ?? [] as c, i (c.id)}
            <a href={`/characters/${c.id}`}>
                <CharacterCard character={c} index={i} showLink={true} />
            </a>
        {/each}
    </div>

    <button onclick={createNewCharacter} class="btn w-full preset-filled-primary-500">Create New Character</button>

    {#if !spells.current.length}
        <div class="card preset-tonal p-4 space-y-2">
            <p class="font-semibold">No spells imported yet</p>
            <p class="text-sm opacity-80">Import spells first so you can add them to your characters.</p>
            <a class="btn preset-filled-secondary-500 w-full sm:w-auto" href="/spells/import">Open Spell Importer</a>
        </div>
    {/if}
</div>
