<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import { spells } from "$lib/stores/stores";
    import { convertSpellCsvRows } from "$lib/types/spell";
    import type { Spell } from "$lib/types/spell";
    import {
        buildSpellFromCsvRow,
        createSourceEntries,
        enrichSpellsWithLookupClasses,
        getSpellIndexUrlFromRepositoryUrl,
        getSpellSourceLookupUrl,
        type SpellSourceLookup,
        type SourceEntry,
        selectAllSources,
        selectRecommendedSources,
        upsertSpellsByNameSource,
    } from "$lib/utils/spell-import";

    /*
     * The user is expected to provide this specific URL: https://github.com/5etools-mirror-3/5etools-src/blob/main/data/spells/index.json
     * Note that the app cannot contain this URL due to legal reasons. Therefore, the user must supply it manually on their own.
     *
     * Then the app must convert the link to the raw version e.g.: https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/spells/index.json
     * The contents of this raw file will be fetched and used for the next steps of the import.
     *
     * The JSON contents of the file are then parsed and converted to an array of spells and stored locally on the client, in localStorage.
     * */

    let repositoryUrl = $state<string>("");
    let indexUrl = $state<string>("");
    let sourceEntries = $state<SourceEntry[]>([]);
    let isLoadingSources = $state(false);
    let isImportingSources = $state(false);
    let loadError = $state("");
    let importError = $state("");
    let importSummary = $state("");

    const selectedCount = $derived.by(() => sourceEntries.filter((entry) => entry.selected).length);

    function setAllSelected(selected: boolean) {
        sourceEntries = selectAllSources(sourceEntries, selected);
    }

    function setRecommendedSelected() {
        sourceEntries = selectRecommendedSources(sourceEntries);
    }

    async function loadSources() {
        loadError = "";
        importError = "";
        importSummary = "";
        sourceEntries = [];

        if (!repositoryUrl.trim()) {
            loadError = "Please enter a valid repository URL first.";
            return;
        }

        isLoadingSources = true;

        try {
            indexUrl = getSpellIndexUrlFromRepositoryUrl(repositoryUrl);

            const response = await fetch(indexUrl);
            if (!response.ok) {
                throw new Error(`Failed to load index file (${response.status}).`);
            }

            const payload = await response.json();
            sourceEntries = createSourceEntries(payload, indexUrl);
        } catch (error) {
            loadError = error instanceof Error ? error.message : "Unable to load the index file.";
        } finally {
            isLoadingSources = false;
        }
    }

    async function importSelectedSources() {
        importError = "";
        importSummary = "";

        const selectedSources = sourceEntries.filter((entry) => entry.selected);
        if (!selectedSources.length) {
            importError = "Select at least one source before importing.";
            return;
        }

        let currentSpells: Spell[] = [];

        isImportingSources = true;

        let filesProcessed = 0;
        let spellsAdded = 0;
        let spellsUpdated = 0;

        try {
            const lookupUrl = getSpellSourceLookupUrl(indexUrl);
            const lookupResponse = await fetch(lookupUrl);
            if (!lookupResponse.ok) {
                throw new Error(`Failed to fetch spell class lookup (${lookupResponse.status}).`);
            }
            const lookupPayload = (await lookupResponse.json()) as SpellSourceLookup;

            for (const entry of selectedSources) {
                const response = await fetch(entry.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${entry.source} (${response.status}).`);
                }

                const sourcePayload = await response.json();
                const rows = convertSpellCsvRows(sourcePayload);
                const incomingSpells = enrichSpellsWithLookupClasses(rows.map(buildSpellFromCsvRow), lookupPayload);
                const mergeResult = upsertSpellsByNameSource(currentSpells, incomingSpells);
                currentSpells = mergeResult.spells;
                spellsAdded += mergeResult.added;
                spellsUpdated += mergeResult.updated;

                filesProcessed += 1;
            }

            spells.current = currentSpells;

            importSummary = `Imported ${filesProcessed} source files and replaced local spells with ${currentSpells.length} entries (${spellsAdded} added, ${spellsUpdated} merged duplicates).`;
        } catch (error) {
            importError = error instanceof Error ? error.message : "Import failed.";
        } finally {
            isImportingSources = false;
        }
    }
</script>

<PageHeader title="Import Spells" subtitle="Bootstrap and update your local data" />

<div class="space-y-4">
    <div class="card preset-tonal p-4 space-y-4">
        <label class="label">
            <span class="label-text">Repository URL</span>
            <input type="url" class="input" placeholder="https://github.com/owner/repository" bind:value={repositoryUrl} />
            <span class="label-text">Index URL: {indexUrl || "(derived when loading sources)"}</span>
        </label>

        <div class="flex gap-3">
            <button class="btn preset-filled-primary-500" onclick={loadSources} disabled={isLoadingSources}>
                {isLoadingSources ? "Loading sources..." : "Load Sources"}
            </button>
        </div>

        {#if loadError}
            <p class="text-error-500">{loadError}</p>
        {/if}
    </div>

    {#if sourceEntries.length > 0}
        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Source Files" subtitle="Select which sources to import" />

            <p class="text-sm opacity-80">{sourceEntries.length} sources found, {selectedCount} selected.</p>
            <div class="flex items-center justify-between gap-3">
                <div class="flex gap-2">
                    <button class="btn btn-sm preset-tonal" onclick={setRecommendedSelected}>Recommended</button>
                    <button class="btn btn-sm preset-tonal" onclick={() => setAllSelected(true)}>Select all</button>
                    <button class="btn btn-sm preset-tonal" onclick={() => setAllSelected(false)}>Select none</button>
                </div>
            </div>

            <div class="space-y-3">
                {#each sourceEntries as entry (entry.source)}
                    <label class="flex items-start gap-3">
                        <input class="checkbox" type="checkbox" bind:checked={entry.selected} />
                        <span class="font-medium">{entry.source}</span>
                        <span class="block text-sm opacity-80">{entry.fileName}</span>
                    </label>
                {/each}
            </div>

            <div class="flex gap-3">
                <button class="btn preset-filled-primary-500" onclick={importSelectedSources} disabled={isImportingSources}>
                    {isImportingSources ? "Importing..." : "Import Selected Sources"}
                </button>
            </div>

            {#if importError}
                <p class="text-error-500">{importError}</p>
            {/if}

            {#if importSummary}
                <p class="text-success-500">{importSummary}</p>
            {/if}
        </div>
    {/if}
</div>
