<script lang="ts">

    import {app} from "$lib/stores/app.svelte";
</script>

{#each app.current.spells as s}
    <pre>{JSON.stringify(s, null, 2)}</pre>
{/each}