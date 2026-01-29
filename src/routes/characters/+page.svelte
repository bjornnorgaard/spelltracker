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

<div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="h1">Characters</h1>
            <p>Manage your D&D 5e characters</p>
        </div>
        <button onclick={handleCreate} class="btn">
            <span class="text-lg mr-1">+</span>
            New Character
        </button>
    </div>

    {#if characterStore.characters.length === 0}
        <div class="card p-4 text-center">
            <div class="flex flex-col gap-4 items-center">
                <div class="text-6xl">🧙</div>
                <h3 class="h3">No Characters Yet</h3>
                <p>Create your first character to start tracking spells!</p>
                <button onclick={handleCreate} class="btn">
                    <span class="text-lg mr-1">+</span>
                    Create Your First Character
                </button>
            </div>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each characterStore.characters as character (character.id)}
                <CharacterCard {character} onSelect={handleView} onEdit={handleEdit} onDelete={handleDeleteClick} />
            {/each}
        </div>
    {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if deleteConfirmId}
    {@const character = characterStore.getCharacter(deleteConfirmId)}
    <div
        class="fixed inset-0 flex items-center justify-center z-50"
        onclick={handleDeleteCancel}
        onkeydown={(e) => e.key === "Escape" && handleDeleteCancel()}
        role="dialog"
        aria-modal="true"
        tabindex="-1">
        <div class="card p-4 max-w-md w-full mx-4" role="document">
            <div class="flex flex-col gap-4">
                <h3 class="h3">Delete Character?</h3>
                <p>
                    Are you sure you want to delete <strong>{character?.name}</strong>? This action cannot be undone.
                </p>
                <div class="flex gap-4">
                    <button onclick={handleDeleteCancel} class="btn flex-1">Cancel</button>
                    <button onclick={handleDeleteConfirm} class="btn flex-1">Delete</button>
                </div>
            </div>
        </div>
    </div>
{/if}
