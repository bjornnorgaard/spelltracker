<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import {createCharacter} from "$lib/utils/createCharacter";
    import {goto} from "$app/navigation";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {formatSpellLevel} from "$lib/utils/spell-formatter";

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
            <a href={`/characters/${c.id}`} class="card preset-filled-primary-50-950 p-4" style={`filter: hue-rotate(${(i)*30}deg)`}>
                <p class="preset-typo-title">{c.name}</p>
                <p class="preset-typo-subtitle">{formatSpellLevel(c.level)} Level {c.class}</p>
                <div class="flex justify-between">
                    <span>{c.spellIds?.length} spells</span>
                    <span class="anchor">View character</span>
                </div>
            </a>
        {/each}
    </div>

    <button onclick={async () => createNewCharacter()} class="btn w-full preset-filled-primary-500">Create New Character</button>
</div>
