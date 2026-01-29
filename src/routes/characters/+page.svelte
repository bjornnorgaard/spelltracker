<script lang="ts">
    import { characterStore } from "$lib/stores/characters.svelte";
    import CharacterCard from "$lib/components/character/CharacterCard.svelte";
    import { goto } from "$app/navigation";

    let deleteConfirmId = $state<string | null>(null);

    function handleCreate() {
        goto("/characters/new");
    }

    function handleEdit(id: string) {
        goto(`/characters/${id}/edit`);
    }

    function handleView(id: string) {
        goto(`/characters/${id}`);
    }

    function handleDeleteClick(id: string) {
        deleteConfirmId = id;
    }

    function handleDeleteConfirm() {
        if (deleteConfirmId) {
            characterStore.deleteCharacter(deleteConfirmId);
            deleteConfirmId = null;
        }
    }

    function handleDeleteCancel() {
        deleteConfirmId = null;
    }
</script>

<svelte:head>
    <title>Characters - D&D Spelltracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="h1">Characters</h1>
            <p class="opacity-75 mt-1">Manage your D&D 5e characters</p>
        </div>
        <button onclick={handleCreate} class="btn preset-filled-primary-500">
            <span class="text-lg mr-1">+</span>
            New Character
        </button>
    </div>

    {#if characterStore.characters.length === 0}
        <div class="card p-12 text-center">
            <div class="text-6xl mb-4">🧙</div>
            <h3 class="h3 mb-2">No Characters Yet</h3>
            <p class="opacity-75 mb-6">Create your first character to start tracking spells!</p>
            <button onclick={handleCreate} class="btn preset-filled-primary-500">
                <span class="text-lg mr-1">+</span>
                Create Your First Character
            </button>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each characterStore.characters as character (character.id)}
                <CharacterCard {character} isActive={character.id === characterStore.activeCharacterId} onSelect={handleView} onEdit={handleEdit} onDelete={handleDeleteClick} />
            {/each}
        </div>
    {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if deleteConfirmId}
    {@const character = characterStore.getCharacter(deleteConfirmId)}
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onclick={handleDeleteCancel}
        onkeydown={(e) => e.key === "Escape" && handleDeleteCancel()}
        role="dialog"
        aria-modal="true"
        tabindex="-1">
        <div class="card p-6 max-w-md w-full mx-4" role="document">
            <h3 class="h3 mb-2">Delete Character?</h3>
            <p class="opacity-75 mb-4">
                Are you sure you want to delete <strong>{character?.name}</strong>? This action cannot be undone.
            </p>
            <div class="flex gap-3">
                <button onclick={handleDeleteConfirm} class="btn preset-filled-error-500 flex-1"> Delete </button>
                <button onclick={handleDeleteCancel} class="btn preset-tonal flex-1"> Cancel </button>
            </div>
        </div>
    </div>
{/if}
