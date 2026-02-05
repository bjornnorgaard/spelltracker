<script lang="ts">
    import {app} from "$lib/stores/app.svelte";
</script>

{#if app.current.characters.length}
    <select class="select">
        {#each app.current.characters as c}
            <option>{c.name} - {c.class} - level {c.level}</option>
        {/each}
    </select>
{:else}
    <a href="/characters/new">
        <div class="card p-4 preset-filled-warning-500">
            <strong>You don't have any characters</strong>
            <p class=""> Click this box to create a new character.</p>
        </div>
    </a>
{/if}