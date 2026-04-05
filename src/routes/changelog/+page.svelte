<script lang="ts">
    import {resolve} from "$app/paths";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {CHANGELOG_ENTRIES} from "$lib/data/changelog";
    import {getChangelogEntriesNewestFirst} from "$lib/utils/changelog";

    const entries = getChangelogEntriesNewestFirst(CHANGELOG_ENTRIES);
</script>

<div class="space-y-8">
    <PageHeader
        title="Changelog"
        subtitle="Release notes for Spelltracker. Newest first."
    />

    {#if entries.length === 0}
        <p class="preset-typo-body-2 opacity-70">No entries yet.</p>
    {:else}
        <ul class="space-y-8 list-none p-0 m-0">
            {#each entries as entry (entry.id)}
                <li class="card bg-surface-100-900 border border-surface-200-800 p-4 space-y-3">
                    <p class="text-xs uppercase tracking-widest opacity-60">{entry.id}</p>
                    <h2 class="preset-typo-title text-lg">{entry.title}</h2>
                    <p class="preset-typo-body-2 opacity-90">{entry.summary}</p>
                    {#if entry.details?.length}
                        <ul class="list-disc pl-5 space-y-1 preset-typo-body-2 opacity-85">
                            {#each entry.details as line (line)}
                                <li>{line}</li>
                            {/each}
                        </ul>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}

    <p class="preset-typo-caption">
        <a href={resolve("/")} class="anchor">Back to home</a>
    </p>
</div>
