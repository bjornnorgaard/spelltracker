<script lang="ts">
    import {onMount} from "svelte";
    import {app} from "$lib/stores/app.svelte";

    const STORAGE_KEY = "spelltracker";

    let backupText = $state("");
    let status = $state("");

    function loadFromStorage() {
        if (typeof localStorage === "undefined") return;
        const raw = localStorage.getItem(STORAGE_KEY);
        backupText = raw ?? JSON.stringify(app.current ?? {}, null, 2);
        status = "Loaded current browser data.";
    }

    onMount(() => {
        loadFromStorage();
    });

    async function copyData() {
        try {
            await navigator.clipboard.writeText(backupText);
            status = "Copied to clipboard.";
        } catch {
            status = "Copy failed. Try selecting the text and copying manually.";
        }
    }

    function downloadData() {
        try {
            const blob = new Blob([backupText], {type: "application/json"});
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

    function applyData() {
        try {
            const parsed = JSON.parse(backupText);
            if (typeof localStorage !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }
            app.current = parsed;
            status = "Backup restored.";
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
        <p class="preset-typo-body-2 text-surface-600-300">
            Copy or download your data from one device, then paste or upload it on another.
        </p>
    </div>

    <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button class="btn preset-filled-primary-500" onclick={copyData}>Copy</button>
            <button class="btn preset-filled-primary-500" onclick={downloadData}>Download</button>
            <button class="btn preset-filled-primary-500" onclick={loadFromStorage}>Refresh</button>
        </div>
        <textarea
            class="textarea w-full min-h-[16rem] font-mono text-sm"
            bind:value={backupText}
        ></textarea>
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <label class="block">
                <span class="preset-typo-caption block mb-1">Upload backup file</span>
                <input class="input" type="file" accept="application/json" onchange={handleFileChange} />
            </label>
            <button class="btn preset-filled-secondary-500 sm:mt-6" onclick={applyData}>
                Restore from Text
            </button>
        </div>
        {#if status}
            <p class="preset-typo-caption">{status}</p>
        {/if}
    </div>
</div>
