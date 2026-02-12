<script lang="ts">
    import { DND_CLASSES } from "$lib/utils/constants";
    import { characters, spells as spellsStore } from "$lib/stores/stores";
    import { formatSpellLevelLong } from "$lib/utils/spell-formatter";
    import { parseSpellCSV } from "$lib/utils/csv-parser";
    import type { Character } from "$lib/types/character";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import { ArrowLeft } from "@lucide/svelte";
    import CharacterCard from "$lib/components/CharacterCard.svelte";
    import { makeSpellId } from "$lib/utils/spell-import";

    const { data } = $props();
    let character: Character = $derived.by(() => characters.current.find((c: any) => c.id === data.characterId));

    let importData = $state("");

    function goBack() {
        history.back();
    }

    async function deleteCharacter() {
        characters.current = characters.current?.filter((c: any) => c.id !== character.id);
        window.location.href = "/";
    }

    async function readClipboard() {
        const text = await navigator.clipboard.readText();
        const result = parseSpellCSV(text);
        if (result.errors.length > 0) {
            importData = result.errors.join("\n");
        }
        importData = text;
    }

    async function handleFileChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        importData = await file.text();
    }

    function runImport() {
        const result = parseSpellCSV(importData);
        if (result.errors.length > 0) {
            importData = result.errors.join("\n");
            return;
        }

        const importedIds: string[] = [];

        for (let spell of result.spells) {
            const normalizedId = makeSpellId(spell.name, spell.source || "custom");
            spell.id = normalizedId;

            const existingSpell = spellsStore.current.find((s: any) => s.id === normalizedId);
            if (existingSpell) {
                existingSpell.id = normalizedId;
                existingSpell.name = spell.name;
                existingSpell.source = spell.source;
                existingSpell.page = spell.page;
                existingSpell.level = spell.level;
                existingSpell.school = spell.school;
                existingSpell.castingTime = spell.castingTime;
                existingSpell.duration = spell.duration;
                existingSpell.range = spell.range;
                existingSpell.components = spell.components;
                existingSpell.classes = spell.classes;
                existingSpell.text = spell.text;
                existingSpell.atHigherLevels = spell.atHigherLevels;
                existingSpell.subclasses = spell.subclasses;
                importedIds.push(existingSpell.id);
            } else {
                spellsStore.current.push(spell);
                importedIds.push(spell.id);
            }
        }

        character.selectedSpellIds = [...new Set([...(character.selectedSpellIds ?? []), ...importedIds])];
    }
</script>

<div class="space-y-4">
    {#if character}
        {@const c = character}
        <div class="flex justify-between gap-2">
            <button class="flex gap-2 items-center" onclick={() => (window.location.href = `/characters/${character.id}`)}>
                <ArrowLeft />
                View
            </button>
        </div>

        <CharacterCard {character} />

        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Character Info" subtitle="This is just to help you tell characters apart, we don't use this information for anything." />
            <label class="label">
                <span class="label-text">Name</span>
                <input type="text" class="input preset-tonal" autocomplete="off" bind:value={c.name} required />
            </label>
            <label class="label">
                <span class="label-text">Level</span>
                <input type="number" min={1} max={20} class="input preset-tonal" bind:value={c.level} required />
            </label>
            <label class="label">
                <span class="label-text">Class</span>
                <select class="select preset-tonal" bind:value={c.class} required>
                    {#each DND_CLASSES as cla (cla)}
                        <option value={cla}>{cla}</option>
                    {/each}
                </select>
            </label>
            <label class="label">
                <span class="label-text">Prepared Spells</span>
                <input type="number" min={1} max={25} class="input preset-tonal" bind:value={c.preparedSpellsLimit} required />
            </label>
        </div>

        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Spell Slots" subtitle="When you're happy with your spell slots, you might want to import spells below." />
            <table class="table">
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>Total Slots</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each c.spellSlots?.filter((s) => s.level !== 0) as s (s.level)}
                        <tr class:opacity-50={!s.total}>
                            <td>{formatSpellLevelLong(s.level)}</td>
                            <td class="text-center">{s.total}</td>
                            <td class="flex">
                                <button class="btn btn-sm" onclick={() => s.total--}>Less</button>
                                <button class="btn btn-sm" onclick={() => s.total++}>More</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="card preset-tonal p-4 space-y-4">
            <SectionHeader title="Import Spellbook" subtitle="Paste the CSV data into the box below, or upload a CSV file." />
            <textarea class="input" rows="5" bind:value={importData} placeholder="Paste spell CSV data here...">
                {importData}
            </textarea>

            <div class="flex flex-col gap-3">
                <label class="label">
                    <span class="label-text">Upload CSV file</span>
                    <input class="input" type="file" accept=".csv,text/csv" onchange={handleFileChange} />
                </label>
                <div class="flex gap-3 sm:ml-auto sm:mt-6">
                    <button class="btn preset-tonal" onclick={() => readClipboard()}>Read Clipboard</button>
                    <button class="btn grow preset-filled-primary-500" onclick={() => runImport()}>Import</button>
                </div>
            </div>
        </div>

        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Spellbook" subtitle="Select character spells, prepared spells, always prepared, and free casts." />
            <button class="btn preset-filled-primary-200-800" onclick={() => (window.location.href = `/characters/${character.id}/spells`)}>Manage Spellbook</button>
        </div>

        <SectionHeader title="Danger Zone" subtitle="Careful. This will delete all your character data. This action is permanent." />
        <button class="btn preset-filled-error-500" onclick={() => deleteCharacter()}>Delete Character</button>
    {/if}
</div>
