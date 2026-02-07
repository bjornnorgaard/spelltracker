<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import {createCharacter} from "$lib/utils/createCharacter";
    import {goto} from "$app/navigation";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {formatSpellLevel} from "$lib/utils/spell-formatter";
    import CharacterCard from "$lib/components/CharacterCard.svelte";

    async function createNewCharacter() {
        let character = createCharacter();
        app.current.characters.push(character);
        await goto(`/characters/${character.id}/edit`);
    }
</script>

<div class="space-y-4">
    <SectionHeader title="Your Characters" subtitle="Here are your characters."/>
    <div class="grid grid-cols-1 gap-4">
        {#each app.current.characters ?? [] as c, i}
            <a href={`/characters/${c.id}`}>
                <CharacterCard character={c} index={i} showLink={true}/>
            </a>
        {/each}
    </div>

    <button onclick={async () => createNewCharacter()} class="btn w-full preset-filled-primary-500">Create New Character</button>
</div>
