<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
</script>

<div class="space-y-4">
    <h2 class="h2 border-b-2">Your Characters</h2>
    <p>Here are the characters you have created. Go to their profile to manage their spell slots.</p>

    {#if app.current.characters.length}
        <ul>
            {#each app.current.characters as c}
                <li class="list-inside list-disc">
                    <a href={`/characters/${c.id}`} class="anchor">{c.name}, {c.class}, level {c.level}</a>
                </li>
            {/each}
        </ul>
    {:else}
        <a href="/characters/new">
            <div class="card p-4 preset-filled-warning-500">
                <strong>You don't have any characters</strong>
                <p class=""> Click this box to create a new character.</p>
            </div>
        </a>
    {/if}

    <a href="/characters/new" class="btn preset-filled-primary-500">Create New Character</a>

    <h2 class="h2 border-b-2">Spells</h2>
    <p>Here are all the spells that your have imported. This list is shared between your characters.</p>

    {#if app.current.spells.length}
        {@const spells = app.current.spells.slice(0, 10)}
        <ul>
            {#each spells as s}
                <li class="list-inside list-disc">
                    <a href={`/spells/${s.id}`} class="anchor">{s.name}</a>
                </li>
            {/each}
            <li class="list-inside list-disc">
                <a href="/spells" class="anchor">... and {app.current.spells.length} more</a>
            </li>
        </ul>
    {:else}
        <div class="card p-4 preset-filled-warning-500">
            <strong>You have no spells</strong>
            <p>Spells can be imported during character creation or from the
                <a class="anchor" href="/spells">spells</a> page.
            </p>
        </div>
    {/if}
</div>
