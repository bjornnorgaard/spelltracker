<script lang="ts">
    import {DND_CLASSES, SPELL_LEVELS} from "$lib/utils/constants";
    import type {Character} from "$lib/types/character";
    import {app} from "$lib/stores/app.svelte";
    import {goto} from "$app/navigation";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";

    let name: string = "";
    let level: number = 1;
    let className: string = "";

    async function submit(e: Event) {
        e.preventDefault();

        const character: Character = {
            id: crypto.randomUUID(),
            class: className,
            level: level,
            name: name,
            knownSpells: [],
            spellSlots: [],
            spellEvents: [],
        };

        for (const l of SPELL_LEVELS) {
            character.spellSlots[l] = {
                level: l,
                used: 0,
                total: 0
            };
        }

        app.current.characters.push(character);
        await goto(`/characters/${character.id}/edit`);
    }
</script>

<div class="space-y-4">
    <PageHeader
            title="Create Character"
            subtitle="Set up a new character with a name, level, and class. You'll add spell slots and spells on the next screen."
    />
    <div class="flex justify-between gap-2">
        <a href={`/`} class="btn preset-tonal">⬅ Home</a>
    </div>
    <SectionHeader title="Character Details" subtitle="Basic details to get your character started."/>
    <form class="space-y-4" onsubmit={submit}>
        <label class="label">
            <span class="label-text">Name</span>
            <input type="text" class="input" autocomplete="off" bind:value={name} placeholder="Sir Hack'a'lot" required>
        </label>

        <label class="label">
            <span class="label-text">Level</span>
            <input type="number" min={1} max={20} class="input" bind:value={level} required>
        </label>

        <label class="label">
            <span class="label-text">Class</span>
            <select class="select" bind:value={className} required>
                {#each DND_CLASSES as c}
                    <option value={c}>{c}</option>
                {/each}
            </select>
        </label>

        <button type="submit" class="btn preset-filled-primary-500">Create</button>
    </form>
</div>
