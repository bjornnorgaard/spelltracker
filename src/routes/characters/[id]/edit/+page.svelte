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

<div class="container mx-auto px-4 py-8 max-w-2xl">
    {#if !character}
        <div class="card p-12 text-center">
            <div class="text-6xl mb-4">❌</div>
            <h2 class="h2 mb-2">Character Not Found</h2>
            <p class="opacity-75 mb-6">The character you're looking for doesn't exist</p>
            <a href="/" class="btn preset-filled-primary-500">Back to Characters</a>
        </div>
    {:else}
        <div class="mb-8">
            <a href="/characters/{characterId}" class="anchor text-sm mb-4 inline-block">
                ← Back to {character.name}
            </a>
            <h1 class="h1 mb-2">Edit Character</h1>
            <p class="opacity-75">Update {character.name}'s details</p>
        </div>

        <div class="card">
            <CharacterForm {character} onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
    {/if}
</div>
