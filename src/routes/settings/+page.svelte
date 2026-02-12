<script lang="ts">
    import { characters, spells } from "$lib/stores/stores";
    import type { Character } from "$lib/types/character";

    let resetStatus = $state("");
    let characterEdits = $state<Record<string, string>>({});
    let editStatus = $state<Record<string, string>>({});

    $effect(() => {
        const charactersList = characters.current ?? [];
        const nextEdits: Record<string, string> = { ...characterEdits };
        const knownIds = new Set<string>();

        for (const character of charactersList) {
            knownIds.add(character.id);
            if (!nextEdits[character.id]) {
                nextEdits[character.id] = JSON.stringify(character, null, 2);
            }
        }

        for (const id of Object.keys(nextEdits)) {
            if (!knownIds.has(id)) {
                delete nextEdits[id];
            }
        }

        const existingKeys = Object.keys(characterEdits);
        const nextKeys = Object.keys(nextEdits);
        const changed = existingKeys.length !== nextKeys.length || nextKeys.some((key) => nextEdits[key] !== characterEdits[key]);

        if (changed) {
            characterEdits = nextEdits;
        }
    });

    function resetLocalData() {
        if (!confirm("Reset local data? This clears spells and characters saved on this device.")) {
            return;
        }
        spells.reset();
        characters.reset();
        characterEdits = {};
        editStatus = {};
        resetStatus = "Local data reset to defaults.";
    }

    function saveCharacter(id: string) {
        const raw = characterEdits[id];
        try {
            const parsed = JSON.parse(raw) as Character;
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                editStatus[id] = "Invalid JSON. Fix the JSON and try again.";
                return;
            }

            const charactersList = characters.current ?? [];
            const index = charactersList.findIndex((character: Character) => character.id === id);
            if (index < 0) {
                editStatus[id] = "Character not found.";
                return;
            }

            charactersList[index] = { ...parsed, id };
            editStatus[id] = "Saved.";
        } catch {
            editStatus[id] = "Invalid JSON. Fix the JSON and try again.";
        }
    }

    function resetCharacter(id: string) {
        const charactersList = characters.current ?? [];
        const character = charactersList.find((item: Character) => item.id === id);
        if (!character) {
            editStatus[id] = "Character not found.";
            return;
        }
        characterEdits[id] = JSON.stringify(character, null, 2);
        editStatus[id] = "Reverted to current data.";
    }
</script>

<div class="space-y-6">
    <div class="space-y-2">
        <h1 class="preset-typo-headline">Settings</h1>
        <p class="preset-typo-body-2 text-surface-600-300">Manage local data and edit character JSON directly.</p>
    </div>

    <section class="space-y-3">
        <h2 class="preset-typo-title">Local Data</h2>
        <p class="preset-typo-caption text-surface-600-300">Resetting clears your local storage and restores an empty roster.</p>
        <button class="btn preset-filled-error-500" onclick={resetLocalData}>Reset Local Data</button>
        {#if resetStatus}
            <p class="preset-typo-caption">{resetStatus}</p>
        {/if}
    </section>

    <section class="space-y-4">
        <div class="space-y-1">
            <h2 class="preset-typo-title">Character JSON</h2>
            <p class="preset-typo-caption text-surface-600-300">Edit each character directly. Save to apply the changes.</p>
        </div>

        {#if (characters.current ?? []).length === 0}
            <p class="preset-typo-caption text-surface-600-300">No characters yet.</p>
        {:else}
            <div class="space-y-4">
                {#each characters.current ?? [] as character (character.id)}
                    <div class="card preset-filled-surface-100-900 p-4 space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="preset-typo-title">{character.name}</p>
                                <p class="preset-typo-caption text-surface-600-300">ID: {character.id}</p>
                            </div>
                        </div>
                        <textarea class="code w-full" rows="10" bind:value={characterEdits[character.id]}></textarea>
                        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <button class="btn preset-filled-primary-500" onclick={() => saveCharacter(character.id)}> Save JSON </button>
                            <button class="btn preset-filled-surface-500" onclick={() => resetCharacter(character.id)}> Reset JSON </button>
                            {#if editStatus[character.id]}
                                <p class="preset-typo-caption">{editStatus[character.id]}</p>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </section>
</div>
