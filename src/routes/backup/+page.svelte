<script lang="ts">
    import { onMount } from "svelte";
    import { characters, spells } from "$lib/stores/stores";

    const LEGACY_STORAGE_KEY = "spelltracker";
    const SPELLS_STORAGE_KEY = "spelltracker:spells";
    const CHARACTERS_STORAGE_KEY = "spelltracker:characters";

    let backupText = $state("");
    let status = $state("");

    function readCurrentData() {
        if (typeof localStorage === "undefined") {
            return {
                spells: spells.current ?? [],
                characters: characters.current ?? [],
            };
        }

        const rawSpells = localStorage.getItem(SPELLS_STORAGE_KEY);
        const rawCharacters = localStorage.getItem(CHARACTERS_STORAGE_KEY);

        if (rawSpells !== null || rawCharacters !== null) {
            return {
                spells: rawSpells ? JSON.parse(rawSpells) : [],
                characters: rawCharacters ? JSON.parse(rawCharacters) : [],
            };
        }

        const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (!rawLegacy) {
            return {
                spells: spells.current ?? [],
                characters: characters.current ?? [],
            };
        }

        const legacy = JSON.parse(rawLegacy) as { spells?: unknown[]; characters?: unknown[] };
        return {
            spells: Array.isArray(legacy?.spells) ? legacy.spells : [],
            characters: Array.isArray(legacy?.characters) ? legacy.characters : [],
        };
    }

    function getStorageText() {
        return JSON.stringify(readCurrentData(), null, 2);
    }

    function loadFromStorage() {
        const text = getStorageText();
        if (typeof text === "string") {
            backupText = text;
            status = "Loaded current browser data.";
        }
    }

    onMount(() => {
        loadFromStorage();
    });

    async function copyData() {
        try {
            const text = getStorageText();
            if (typeof text === "string") {
                backupText = text;
            }
            await navigator.clipboard.writeText(backupText);
            status = "Copied to clipboard.";
        } catch {
            status = "Copy failed. Try selecting the text and copying manually.";
        }
    }

    function downloadData() {
        try {
            const text = getStorageText();
            if (typeof text === "string") {
                backupText = text;
            }
            const blob = new Blob([backupText], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `spelltracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
            status = "Download started.";
        } catch {
            status = "Download failed.";
        }
    }

    function formatImportSummary(data: unknown) {
        const importedCharacters =
            (Array.isArray((data as { characters?: unknown })?.characters) ? (data as { characters?: Array<{ name?: string; preparedSpellIds?: string[]; spellIds?: string[] }> }).characters : []) ??
            [];
        if (importedCharacters.length === 0) return "Backup restored. No characters found.";
        const details = importedCharacters.map((character) => {
            const name = typeof character?.name === "string" ? character.name : "Unnamed";
            const spellCount = Array.isArray(character?.preparedSpellIds) ? character.preparedSpellIds.length : Array.isArray(character?.spellIds) ? character.spellIds.length : 0;
            return `${name} (${spellCount} spells)`;
        });
        return `Backup restored. ${details.join(", ")}.`;
    }

    async function applyData() {
        try {
            const parsed = JSON.parse(backupText);
            const parsedSpells = Array.isArray(parsed?.spells) ? parsed.spells : [];
            const parsedCharacters = Array.isArray(parsed?.characters) ? parsed.characters : [];

            spells.current = parsedSpells;
            characters.current = parsedCharacters;

            if (typeof localStorage !== "undefined") {
                localStorage.setItem(SPELLS_STORAGE_KEY, JSON.stringify(parsedSpells));
                localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(parsedCharacters));
            }
            status = formatImportSummary(parsed);
            window.location.href = "/";
        } catch {
            status = "Invalid JSON. Please paste the full backup data.";
        }
    }

    async function handleFileChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        backupText = await file.text();
        status = "Loaded file into the editor.";
    }
</script>

<div class="space-y-6">
    <div class="space-y-2">
        <h1 class="preset-typo-headline">Backup & Restore</h1>
        <p class="preset-typo-body-2 text-surface-600-300">Copy or download your data from one device, then paste or upload it on another.</p>
    </div>

    <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button class="btn preset-filled-primary-500" onclick={copyData}>Copy</button>
            <button class="btn preset-filled-primary-500" onclick={downloadData}>Download</button>
        </div>
        <textarea class="textarea w-full font-mono text-sm" bind:value={backupText} rows="10"></textarea>
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <label class="block">
                <span class="preset-typo-caption block mb-1">Upload backup file</span>
                <input class="input" type="file" accept="application/json" onchange={handleFileChange} />
            </label>
            <button class="btn preset-filled-primary-500 sm:mt-6" onclick={applyData}> Restore from Text </button>
        </div>
        {#if status}
            <p class="preset-typo-caption">{status}</p>
        {/if}
    </div>
</div>
