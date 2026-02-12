<script lang="ts">

    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {app} from "$lib/stores/app.svelte";
    import {spells} from "$lib/stores/stores";
</script>

<PageHeader title="Spells" subtitle="Manage your spells"/>

<a href="/spells/import">Import Spells</a>

<pre>{JSON.stringify(spells.current, null, 2)}</pre>

<SectionHeader title="Spells" subtitle="Manage your spells"/>