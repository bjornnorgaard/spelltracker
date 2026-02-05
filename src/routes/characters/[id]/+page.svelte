<script lang="ts">
    import {DND_CLASSES} from "$lib/utils/constants";

    const {data} = $props();
</script>

{#if data.character}
    {@const c = data.character}

    <pre>{JSON.stringify(c, null, 2)}</pre>

    <label class="label">
        <span class="label-text">Name</span>
        <input type="text" class="input" autocomplete="off" bind:value={c.name} placeholder="Sir Hack'a'lot" required>
    </label>

    <label class="label">
        <span class="label-text">Level</span>
        <input type="number" min={1} max={20} class="input" bind:value={c.level} required>
    </label>

    <label class="label">
        <span class="label-text">Class</span>
        <select class="select" bind:value={c.class} required>
            {#each DND_CLASSES as c}
                <option value={c}>{c}</option>
            {/each}
        </select>
    </label>

    <!--    Create spell slot editor here. Should allow the user to adjust the number of slots per level-->
{/if}
