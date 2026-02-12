<script lang="ts">
    import {spells} from "$lib/stores/stores";
    import type {Spell} from "$lib/types/spell";
    import {convertSpellCsvRows} from "$lib/types/spell";
    import {buildSpellFromCsvRow, createSourceEntries, enrichSpellsWithLookupClasses, getSpellIndexUrlFromRepositoryUrl, getSpellSourceLookupUrl, selectAllSources, selectRecommendedSources, type SourceEntry, type SpellSourceLookup, upsertSpellsByNameSource,} from "$lib/utils/spell-import";
    import Section from "$lib/components/Section.svelte";

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
                loadError = `Failed to load index file (${response.status}).`;
                return;
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
                importError = `Failed to fetch spell class lookup (${lookupResponse.status}).`;
                return;
            }
            const lookupPayload = (await lookupResponse.json()) as SpellSourceLookup;

            for (const entry of selectedSources) {
                const response = await fetch(entry.url);
                if (!response.ok) {
                    importError = `Failed to fetch ${entry.source} (${response.status}).`;
                    return;
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

<div class="space-y-8">
    {#if !sourceEntries.length}
        <Section title="Import Spells" subtitle="Bootstrap and update your local data">
            <div class="space-y-4 card preset-tonal p-4">
                <label class="label">
                    <span class="label-text">Repository</span>
                    <input type="url" class="input" placeholder="owner/repository" bind:value={repositoryUrl}/>
                </label>
                <div class="flex gap-4">
                    <button class="btn preset-filled-primary-500" onclick={loadSources} disabled={isLoadingSources}>
                        {isLoadingSources ? "Loading sources..." : "Load Sources"}
                    </button>
                </div>
                {#if loadError}
                    <p class="text-error-500">{loadError}</p>
                {/if}
            </div>
        </Section>
    {:else}
        <Section title="Source Selection" subtitle="Choose which sources to import">
            <div class="card p-4 preset-tonal space-y-4">
                <p class="text-sm opacity-80">{sourceEntries.length} sources found, {selectedCount} selected.</p>
                <div class="flex items-center justify-between gap-3">
                    <div class="flex gap-2 flex-wrap">
                        <button class="btn grow preset-tonal" onclick={() => setAllSelected(true)}>Select all</button>
                        <button class="btn grow preset-tonal" onclick={() => setAllSelected(false)}>Select none</button>
                        <button class="btn grow preset-tonal" onclick={() => setRecommendedSelected()}>Recommended</button>
                    </div>
                </div>

                <div class="space-y-3">
                    {#each sourceEntries as entry (entry.source)}
                        <label class="flex items-start gap-3">
                            <input class="checkbox" type="checkbox" bind:checked={entry.selected}/>
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
                    <a href="/" class="w-full btn preset-filled-primary-500">Go Back Home</a>
                {/if}
            </div>
        </Section>
    {/if}
</div>
