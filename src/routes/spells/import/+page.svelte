<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import { convertToRawLink } from "$lib/utils/convertToRawLink";
    import { app } from "$lib/stores/app.svelte";
    import { convertSpellCsvRows, type SpellCsvRow } from "$lib/types/spell";
    import type { Spell } from "$lib/types/spell";
    import { parseSpellLevel } from "$lib/utils/spell-formatter";

    /*
     * The user is expected to provide this specific URL: https://github.com/5etools-mirror-3/5etools-src/blob/main/data/spells/index.json
     * Note that the app cannot contain this URL due to legal reasons. Therefore, the user must supply it manually on their own.
     *
     * Then the app must convert the link to the raw version e.g.: https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/spells/index.json
     * The contents of this raw file will be fetched and used for the next steps of the import.
     *
     * The JSON contents of the file are then parsed and converted to an array of spells and stored locally on the client, in localStorage.
     * */

    type SourceEntry = {
        source: string;
        fileName: string;
        url: string;
        selected: boolean;
    };

    let originalUrl = $state<string>("");
    let converted = $derived.by(() => convertToRawLink(originalUrl));
    let sourceEntries = $state<SourceEntry[]>([]);
    let isLoadingSources = $state(false);
    let isImportingSources = $state(false);
    let loadError = $state("");
    let importError = $state("");
    let importSummary = $state("");

    const selectedCount = $derived.by(() => sourceEntries.filter((entry) => entry.selected).length);

    function sourceFileToUrl(fileName: string, indexUrl: string): string {
        try {
            return new URL(fileName, indexUrl).toString();
        } catch {
            return fileName;
        }
    }

    function splitCommaValues(value: string): string[] {
        return value
            .split(",")
            .map((part) => part.trim())
            .filter((part) => part.length > 0);
    }

    function buildSpellFromCsvRow(row: SpellCsvRow): Spell {
        return {
            id: `${row.name}|${row.source}`.toLowerCase(),
            name: row.name,
            source: row.source,
            page: row.page,
            level: parseSpellLevel(row.level),
            castingTime: row.castingTime,
            duration: row.duration,
            school: row.school,
            range: row.range,
            components: row.components,
            classes: splitCommaValues(row.classes),
            subclasses: row.subclasses,
            text: row.text,
            atHigherLevels: row.atHigherLevels,
        };
    }

    function setAllSelected(selected: boolean) {
        for (const entry of sourceEntries) {
            entry.selected = selected;
        }
    }

    function setRecommendedSelected() {
        const recommended = new Set(["TCE", "XGE", "XPHB"]);
        for (const entry of sourceEntries) {
            entry.selected = recommended.has(entry.source.toUpperCase());
        }
    }

    async function loadSources() {
        loadError = "";
        importError = "";
        importSummary = "";
        sourceEntries = [];

        if (!converted.trim()) {
            loadError = "Please enter a valid index URL first.";
            return;
        }

        isLoadingSources = true;

        try {
            const response = await fetch(converted);
            if (!response.ok) {
                throw new Error(`Failed to load index file (${response.status}).`);
            }

            const payload = await response.json();
            if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
                throw new Error("The index file must be a JSON object of source-to-file mappings.");
            }

            const entries = Object.entries(payload)
                .filter((item): item is [string, string] => typeof item[0] === "string" && typeof item[1] === "string")
                .map(([source, fileName]) => ({
                    source,
                    fileName,
                    url: sourceFileToUrl(fileName, converted),
                    selected: true,
                }));

            if (!entries.length) {
                throw new Error("No source files were found in this index.");
            }

            sourceEntries = entries;
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

        if (!Array.isArray(app.current.spells)) {
            app.current.spells = [];
        }

        isImportingSources = true;

        let filesProcessed = 0;
        let spellsAdded = 0;
        let spellsUpdated = 0;

        try {
            for (const entry of selectedSources) {
                const response = await fetch(entry.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${entry.source} (${response.status}).`);
                }

                const sourcePayload = await response.json();
                const rows = convertSpellCsvRows(sourcePayload);
                const spells = rows.map(buildSpellFromCsvRow);

                for (const spell of spells) {
                    const existingIndex = app.current.spells.findIndex((existing: Spell) => existing.name === spell.name && existing.source === spell.source);

                    if (existingIndex >= 0) {
                        app.current.spells[existingIndex] = {
                            ...app.current.spells[existingIndex],
                            ...spell,
                            id: app.current.spells[existingIndex].id || spell.id,
                        };
                        spellsUpdated += 1;
                    } else {
                        app.current.spells.push(spell);
                        spellsAdded += 1;
                    }
                }

                filesProcessed += 1;
            }

            importSummary = `Imported ${filesProcessed} source files. Added ${spellsAdded} spells and updated ${spellsUpdated}.`;
        } catch (error) {
            importError = error instanceof Error ? error.message : "Import failed.";
        } finally {
            isImportingSources = false;
        }
    }
</script>

<PageHeader title="Import Spells" subtitle="Bootstrap and update your local data" />

<div class="space-y-4">
    <SectionHeader title="Import Spells" subtitle="Provide URL to data index JSON" />

    <div class="card preset-tonal p-4 space-y-4">
        <label class="label">
            <span class="label-text">Data Index URL</span>
            <input type="url" class="input" placeholder="https://example.com/data/spells/index.json" bind:value={originalUrl} />
            <span class="label-text">Raw URL: {converted || "—"}</span>
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

            <div class="flex items-center justify-between gap-3">
                <p class="text-sm opacity-80">{sourceEntries.length} sources found, {selectedCount} selected.</p>
                <div class="flex gap-2">
                    <button class="btn btn-sm preset-tonal" onclick={() => setAllSelected(true)}>Select all</button>
                    <button class="btn btn-sm preset-tonal" onclick={setRecommendedSelected}>Recommended</button>
                    <button class="btn btn-sm preset-tonal" onclick={() => setAllSelected(false)}>Select none</button>
                </div>
            </div>

            <div class="space-y-3">
                {#each sourceEntries as entry (entry.source)}
                    <label class="flex items-start gap-3">
                        <input class="checkbox" type="checkbox" bind:checked={entry.selected} />
                        <span class="flex-1">
                            <span class="font-medium">{entry.source}</span>
                            <span class="block text-sm opacity-80">{entry.fileName}</span>
                            <span class="block text-xs opacity-70 break-all">{entry.url}</span>
                        </span>
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
