<script lang="ts">
    import { page } from "$app/state";
    import CharacterForm from "$lib/components/character/CharacterForm.svelte";
    import { characterStore } from "$lib/stores/characters.svelte";
    import { goto } from "$app/navigation";
    import type { Character } from "$lib/types/character";

    let characterId = $derived(page.params.id ?? "");
    let character = $derived(characterStore.getCharacter(characterId));

    function handleSubmit(data: Omit<Character, "id">) {
        if (characterId) {
            characterStore.updateCharacter(characterId, data);
            goto(`/characters/${characterId}`);
        }
    }

    function handleCancel() {
        goto(`/characters/${characterId}`);
    }
</script>

<svelte:head>
    <title>Edit Character - D&D Spelltracker</title>
</svelte:head>

<div class="flex flex-col gap-4">
    {#if !character}
        <div class="card p-4 text-center">
            <div class="flex flex-col gap-4 items-center">
                <div class="text-6xl">❌</div>
                <h2 class="h2">Character Not Found</h2>
                <p>The character you're looking for doesn't exist</p>
                <a href="/" class="btn">Back to Characters</a>
            </div>
        </div>
    {:else}
        <div class="flex flex-col gap-4">
            <a href="/characters/{characterId}" class="text-sm">
                ← Back to {character.name}
            </a>
            <div>
                <h1 class="h1">Edit Character</h1>
                <p>Update {character.name}'s details</p>
            </div>
        </div>

        <div class="card p-4">
            <CharacterForm {character} onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
    {/if}
</div>
