<script lang="ts">
    import { characterStore } from "$lib/stores/characters.svelte";
    import CharacterCard from "$lib/components/character/CharacterCard.svelte";
    import CharacterForm from "$lib/components/character/CharacterForm.svelte";
    import type { Character } from "$lib/types/character";

    let showForm = $state(false);
    let editingCharacter = $state<Character | undefined>(undefined);
    let deleteConfirmId = $state<string | null>(null);

    function handleCreate() {
        editingCharacter = undefined;
        showForm = true;
    }

    function handleEdit(id: string) {
        const character = characterStore.getCharacter(id);
        if (character) {
            editingCharacter = character;
            showForm = true;
        }
    }

    function handleSubmit(data: Omit<Character, "id">) {
        if (editingCharacter) {
            // Update existing character
            characterStore.updateCharacter(editingCharacter.id, data);
        } else {
            // Create new character
            const newCharacter: Character = {
                id: crypto.randomUUID(),
                ...data,
            };
            characterStore.addCharacter(newCharacter);
        }
        showForm = false;
        editingCharacter = undefined;
    }

    function handleCancel() {
        showForm = false;
        editingCharacter = undefined;
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

    function handleSelect(id: string) {
        characterStore.activeCharacterId = id;
    }
</script>

<svelte:head>
    <title>Characters - D&D Spelltracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold">Characters</h1>
            <p class="text-gray-600 mt-1">Manage your D&D 5e characters</p>
        </div>
        <button onclick={handleCreate} class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"> + New Character </button>
    </div>

    {#if showForm}
        <div class="mb-6 p-6 bg-white border rounded-lg shadow-sm">
            <h2 class="text-xl font-semibold mb-4">
                {editingCharacter ? "Edit Character" : "Create New Character"}
            </h2>
            <CharacterForm character={editingCharacter} onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
    {/if}

    {#if characterStore.characters.length === 0}
        <div class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <div class="text-6xl mb-4">🧙</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No Characters Yet</h3>
            <p class="text-gray-600 mb-4">Create your first character to start tracking spells!</p>
            <button onclick={handleCreate} class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"> Create Your First Character </button>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each characterStore.characters as character (character.id)}
                <CharacterCard {character} isActive={character.id === characterStore.activeCharacterId} onSelect={handleSelect} onEdit={handleEdit} onDelete={handleDeleteClick} />
            {/each}
        </div>
    {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if deleteConfirmId}
    {@const character = characterStore.getCharacter(deleteConfirmId)}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold mb-2">Delete Character?</h3>
            <p class="text-gray-600 mb-4">
                Are you sure you want to delete <strong>{character?.name}</strong>? This action cannot be undone.
            </p>
            <div class="flex gap-3">
                <button onclick={handleDeleteConfirm} class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"> Delete </button>
                <button onclick={handleDeleteCancel} class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"> Cancel </button>
            </div>
        </div>
    </div>
{/if}
