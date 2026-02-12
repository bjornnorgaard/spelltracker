<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import { convertToRawLink } from "$lib/utils/convertToRawLink";

    /*
    * The user is expected to provide this specific URL: https://github.com/5etools-mirror-3/5etools-src/blob/main/data/spells/index.json
    * Note that the app cannot contain this URL due to legal reasons. Therefore, the user must supply it manually on their own.
    *
    * Then the app must convert the link to the raw version e.g.: https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data/spells/index.json
    * The contents of this raw file will be fetched and used for the next steps of the import.
    *
    * The JSON contents of the file are then parsed and converted to an array of spells and stored locally on the client, in localStorage.
    * */

    let originalUrl = $state<string>("");
    let converted = $derived.by(() => convertToRawLink(originalUrl));

</script>

<PageHeader title="Import Spells" subtitle="Bootstrap and update your local data"/>

<SectionHeader title="Import Spells" subtitle="Provide URL to data index JSON"/>

<label class="label">
    <span class="label-text">Data Index URL</span>
    <input type="url" class="input" placeholder="https://example.com/data/spells/index.json" bind:value={originalUrl}>
    <span>{converted}</span>
</label>
