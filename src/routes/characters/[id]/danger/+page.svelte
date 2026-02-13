<script lang="ts">
    import Section from "$lib/components/Section.svelte";
    import {characters} from "$lib/stores/stores";

    const {data} = $props();

    async function deleteCharacter() {
        characters.current = characters.current?.filter((c: any) => c.id !== data.characterId);
        window.location.href = "/";
    }
</script>

<div class="space-y-8">
    <Section title="Danger Zone" subtitle="Careful. This will delete all your character data. This action is permanent and cannot be undone">
        <button class="btn preset-filled-error-500" onclick={() => deleteCharacter()}>Delete Character</button>
    </Section>
</div>