<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { characterStore } from "$lib/stores/characters.svelte";
    import { spellStore } from "$lib/stores/spells.svelte";
    import { getDemoSpellCSV, parseSpellCSV } from "$lib/utils/spell-csv-parser";

    const characterId = $derived(page.params.id ?? "");
    const character = $derived(characterStore.getCharacter(characterId));

    let csvInput = $state("");
    let errorMessage = $state("");
    let successMessage = $state("");
    let isProcessing = $state(false);

    function loadDemoData() {
        csvInput = getDemoSpellCSV();
        errorMessage = "";
        successMessage = "";
    }

    function handleImport() {
        if (!character) {
            errorMessage = "Character not found";
            return;
        }

        if (!csvInput.trim()) {
            errorMessage = "Please paste CSV data";
            return;
        }

        isProcessing = true;
        errorMessage = "";
        successMessage = "";

        try {
            // Parse the CSV
            const spells = parseSpellCSV(csvInput);

            if (spells.length === 0) {
                errorMessage = "No valid spells found in the CSV data";
                isProcessing = false;
                return;
            }

            // Add spells to the spell store
            spellStore.addSpells(spells);

            // Add spell IDs to character's known spells
            const spellIds = spells.map((s) => s.id);
            const updatedKnownSpells = [...new Set([...character.knownSpells, ...spellIds])];

            characterStore.updateCharacter(characterId, {
                knownSpells: updatedKnownSpells,
            });

            successMessage = `Successfully imported ${spells.length} spell${spells.length !== 1 ? "s" : ""}!`;
            csvInput = "";

            // Redirect after short delay
            setTimeout(() => {
                goto(`/characters/${characterId}`);
            }, 1500);
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : "Failed to parse CSV data";
        } finally {
            isProcessing = false;
        }
    }

    function handleCancel() {
        goto(`/characters/${characterId}`);
    }
</script>

<svelte:head>
    <title>Import Spells - {character?.name || "Character"} - D&D Spelltracker</title>
</svelte:head>

{#if !character}
    <div class="flex flex-col gap-4">
        <div class="card p-4 text-center">
            <div class="flex flex-col gap-4 items-center">
                <h2 class="h2">Character Not Found</h2>
                <p>The character you're looking for doesn't exist.</p>
                <button onclick={() => goto("/characters")} class="btn"> Back to Characters </button>
            </div>
        </div>
    </div>
{:else}
    <div class="flex flex-col gap-4">
        <!-- Breadcrumb -->
        <nav class="text-sm">
            <ol class="flex items-center gap-4">
                <li><a href="/characters">Characters</a></li>
                <li>/</li>
                <li>
                    <a href="/characters/{characterId}">{character.name}</a>
                </li>
                <li>/</li>
                <li>Import Spells</li>
            </ol>
        </nav>

        <!-- Header -->
        <div>
            <h1 class="h1">Import Spells</h1>
            <p>
                Import spells for <strong>{character.name}</strong> by pasting CSV data
            </p>
        </div>

        <!-- Instructions Card -->
        <div class="card p-4">
            <div class="flex flex-col gap-4">
                <h2 class="h3">Instructions</h2>
                <ol class="list-decimal list-inside flex flex-col gap-4">
                    <li>Copy spell data in CSV format from your source</li>
                    <li>Paste the data into the text area below</li>
                    <li>Click "Import Spells" to add them to {character.name}'s spell list</li>
                </ol>
                <button onclick={loadDemoData} class="btn text-sm"> Load Demo Data </button>
            </div>
        </div>

        <!-- CSV Input -->
        <div class="card p-4">
            <div class="flex flex-col gap-4">
                <label for="csv-input" class="label">
                    <span>CSV Spell Data</span>
                </label>
                <textarea id="csv-input" bind:value={csvInput} placeholder="Paste CSV data here..." class="textarea" rows="15" disabled={isProcessing}></textarea>

                {#if errorMessage}
                    <div class="card p-4" role="alert">
                        <span>⚠️ {errorMessage}</span>
                    </div>
                {/if}

                {#if successMessage}
                    <div class="card p-4" role="alert">
                        <span>✓ {successMessage}</span>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
            <button onclick={handleImport} disabled={isProcessing || !csvInput.trim()} class="btn">
                {isProcessing ? "Importing..." : "Import Spells"}
            </button>
            <button onclick={handleCancel} disabled={isProcessing} class="btn"> Cancel </button>
        </div>
    </div>
{/if}
