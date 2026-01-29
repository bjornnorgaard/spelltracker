<script lang="ts">
    import { characterStore } from "$lib/stores/characters.svelte";
    import CharacterCard from "$lib/components/character/CharacterCard.svelte";
    import { goto } from "$app/navigation";

    function handleCreateCharacter() {
        goto("/characters/new");
    }

    function handleSelectCharacter(id: string) {
        characterStore.activeCharacterId = id;
    }

    function handleEditCharacter(id: string) {
        goto(`/characters/${id}/edit`);
    }

    function handleViewCharacter(id: string) {
        goto(`/characters/${id}`);
    }

    let deleteConfirmId = $state<string | null>(null);

    function handleDeleteClick(id: string) {
        deleteConfirmId = id;
    }

    function confirmDelete() {
        if (deleteConfirmId) {
            characterStore.deleteCharacter(deleteConfirmId);
            deleteConfirmId = null;
        }
    }

    function cancelDelete() {
        deleteConfirmId = null;
    }
</script>

<svelte:head>
    <title>Characters - D&D Spelltracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 class="h1 mb-1">Your Characters</h1>
            <p class="opacity-75">Manage your D&D characters and their spells</p>
        </div>
        <button onclick={handleCreateCharacter} class="btn preset-filled-primary-500">
            <span class="text-lg mr-1">+</span>
            Create Character
        </button>
    </div>

    <!-- Characters Grid -->
    {#if characterStore.characters.length === 0}
        <div class="card p-12 text-center">
            <div class="text-6xl mb-4">🎭</div>
            <h2 class="h2 mb-2">No Characters Yet</h2>
            <p class="opacity-75 mb-6">Create your first character to get started tracking spells</p>
            <button onclick={handleCreateCharacter} class="btn preset-filled-primary-500">
                <span class="text-lg mr-1">+</span>
                Create Your First Character
            </button>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each characterStore.characters as character (character.id)}
                <CharacterCard {character} isActive={character.id === characterStore.activeCharacterId} onSelect={handleViewCharacter} onEdit={handleEditCharacter} onDelete={handleDeleteClick} />
            {/each}
        </div>
    {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if deleteConfirmId}
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onclick={cancelDelete}
        onkeydown={(e) => e.key === "Escape" && cancelDelete()}
        role="dialog"
        aria-modal="true"
        tabindex="-1">
        <div class="card p-6 max-w-sm w-full" role="document">
            <h3 class="h3 mb-4">Delete Character?</h3>
            <p class="opacity-75 mb-6">Are you sure you want to delete this character? This action cannot be undone.</p>
            <div class="flex gap-3">
                <button onclick={confirmDelete} class="btn preset-filled-error-500 flex-1"> Delete </button>
                <button onclick={cancelDelete} class="btn preset-tonal flex-1">Cancel</button>
            </div>
        </div>
    </div>
{/if}
