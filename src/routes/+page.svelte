<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import {createCharacter} from "$lib/utils/createCharacter";
    import {goto} from "$app/navigation";
    import SectionHeader from "$lib/components/SectionHeader.svelte";

    async function createNewCharacter() {
        let character = createCharacter();
        app.current.characters.push(character);
        await goto(`/characters/${character.id}/edit`);
    }
</script>

<div class="space-y-4">
    <SectionHeader title="Your Characters" subtitle="Here are your characters."/>
    <ul>
        {#each app.current.characters ?? [] as c}
            <li class="card preset-tonal p-4">

                <a href={`/characters/${c.id}`} class="anchor">{c.name}, {c.class}, level {c.level}</a>
            </li>
        {/each}
    </ul>

    <button onclick={async () => createNewCharacter()} class="btn w-full preset-filled-primary-500">Create New Character</button>
</div>
