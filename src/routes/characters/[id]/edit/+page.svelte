<script lang="ts">
    import {DND_CLASSES} from "$lib/utils/constants";
    import {app} from "$lib/stores/app.svelte.js";
    import {goto} from "$app/navigation";
    import {formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {parseSpellCSV} from "$lib/utils/csv-parser";
    import type {Character} from "$lib/types/character";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {ArrowLeft} from "@lucide/svelte";
    import CharacterCard from "$lib/components/CharacterCard.svelte";

    const {data} = $props();
    let character: Character = $derived.by(() => app.current.characters.find((c: any) => c.id === data.characterId));

    let importData = $state("");

    function goBack() {
        history.back();
    }

    async function deleteCharacter() {
        app.current.characters = app.current.characters?.filter((c: any) => c.id !== character.id);
        await goto("/");
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
        // Parse CSV
        const result = parseSpellCSV(importData);

        // Fetch existing spells
        const characterSpellIds = [];

        for (let spell of result.spells) {
            // If an existing spell is found, update it.
            const existingSpell = app.current.spells.find((s: any) => s.name === spell.name);
            if (existingSpell) {
                existingSpell.page = spell.page;
                existingSpell.level = spell.level;
                existingSpell.school = spell.school;
                existingSpell.castingTime = spell.castingTime;
                existingSpell.duration = spell.duration;
                existingSpell.range = spell.range;
                existingSpell.components = spell.components;
                existingSpell.classes = spell.classes;
                characterSpellIds.push(existingSpell.id);
            } else {
                app.current.spells.push(spell);
                characterSpellIds.push(spell.id);
            }
        }

        app.current.characters.find((c: Character) => c.id === character.id).spellIds = characterSpellIds;
    }

</script>

<div class="space-y-4">
    {#if character}
        {@const c = character}
        <div class="flex justify-between gap-2">
            <a class="flex gap-2 items-center" href="/characters/{character.id}">
                <ArrowLeft/>
                View
            </a>
        </div>

        <CharacterCard character={character}/>

        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Character Info" subtitle="This is just to help you tell characters apart, we don't use this information for anything."/>
            <label class="label">
                <span class="label-text">Name</span>
                <input type="text" class="input preset-tonal" autocomplete="off" bind:value={c.name} required>
            </label>
            <label class="label">
                <span class="label-text">Level</span>
                <input type="number" min={1} max={20} class="input preset-tonal" bind:value={c.level} required>
            </label>
            <label class="label">
                <span class="label-text">Class</span>
                <select class="select preset-tonal" bind:value={c.class} required>
                    {#each DND_CLASSES as cla}
                        <option value={cla}>{cla}</option>
                    {/each}
                </select>
            </label>
            <label class="label">
                <span class="label-text">Prepared Spells</span>
                <input type="number" min={1} max={25} class="input preset-tonal" bind:value={c.preparedLimit} required>
            </label>
        </div>

        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Spell Slots" subtitle="When you're happy with your spell slots, you might want to import spells below."/>
            <table class="table">
                <thead>
                <tr>
                    <th>Level</th>
                    <th>Total Slots</th>
                    <th class="text-right">Actions</th>
                </tr>
                </thead>
                <tbody>
                {#each c.spellSlots?.filter(s => s.level !== 0) as s}
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
            <SectionHeader title="Import Spellbook" subtitle="Paste the CSV data into the box below, or upload a CSV file."/>
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

        <SectionHeader title="Danger Zone" subtitle="Careful. This will delete all your character data. This action is permanent."/>
        <button class="btn preset-filled-error-500" onclick={() => deleteCharacter()}>Delete Character</button>
    {/if}
</div>
