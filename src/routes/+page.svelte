<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
</script>

<div class="space-y-4">
    <PageHeader title="Spell Tracker" subtitle="Track your spell slots and their spells."/>

    <SectionHeader title="Getting Started" subtitle="Follow these steps to get started with Spell Tracker."/>
    <ol class="list-decimal list-inside">
        <li>Create a character.</li>
        <li>Add spell slots.</li>
        <li>Import spells.</li>
    </ol>

    <SectionHeader title="Your Characters" subtitle="Here are your characters."/>
    <ul>
        {#each app.current.characters as c}
            <li class="list-inside list-disc">
                <a href={`/characters/${c.id}`} class="anchor">{c.name}, {c.class}, level {c.level}</a>
            </li>
        {/each}
    </ul>

    <a href="/characters/new" class="btn w-full preset-filled-primary-500">Create New Character</a>
</div>
