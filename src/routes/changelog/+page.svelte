<script lang="ts">
    import {resolve} from "$app/paths";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {CHANGELOG_ENTRIES} from "$lib/data/changelog";
    import {changelogAck, getChangelogAck} from "$lib/stores/stores";
    import {getChangelogEntriesNewestFirst, getShippedEntryIds, isChangelogEntryUnread, withEntryMarkedRead, withEntryMarkedUnread,} from "$lib/utils/changelog";
    import {Megaphone} from "@lucide/svelte";

    const entries = getChangelogEntriesNewestFirst(CHANGELOG_ENTRIES);

    const readEntryIds = $derived.by(() => {
        changelogAck.current;
        return getChangelogAck().readEntryIds;
    });

    const hasUnread = $derived.by(() => entries.some((e) => isChangelogEntryUnread(e.id, readEntryIds)));

    function markAllRead() {
        changelogAck.current = {readEntryIds: getShippedEntryIds(CHANGELOG_ENTRIES)};
    }

    function markOneRead(entryId: string) {
        changelogAck.current = {readEntryIds: withEntryMarkedRead(getChangelogAck().readEntryIds, entryId)};
    }

    function markOneUnread(entryId: string) {
        changelogAck.current = {readEntryIds: withEntryMarkedUnread(getChangelogAck().readEntryIds, entryId)};
    }
</script>

<div class="space-y-8">
    <PageHeader
        title="Changelog"
        subtitle="Release notes for Spelltracker. Newest first."
    />

    {#if entries.length === 0}
        <p class="preset-typo-body-2 opacity-70">No entries yet.</p>
    {:else}
        <div class="flex flex-wrap items-center justify-end gap-2">
            <button
                type="button"
                class="btn preset-filled-success-500 text-sm"
                onclick={markAllRead}
                disabled={!hasUnread}
            >
                Mark all as read
            </button>
        </div>

        <ul class="space-y-6 list-none p-0 m-0">
            {#each entries as entry (entry.id)}
                {@const unread = isChangelogEntryUnread(entry.id, readEntryIds)}
                <li
                    class="card p-4 space-y-3 {unread
                        ? 'preset-outlined-success-500'
                        : 'border border-surface-200-800 opacity-75 text-surface-600-400'}"
                >
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 uppercase tracking-widest text-xs min-w-0">
                            {#if unread}
                                <Megaphone class="text-success-500 shrink-0" size={16} aria-hidden="true"/>
                                <span class="text-surface-600-400">{entry.id}</span>
                                <span class="text-success-500 font-medium normal-case tracking-normal">Unread</span>
                            {:else}
                                <span>{entry.id}</span>
                            {/if}
                        </div>
                        <div class="flex flex-wrap gap-2 shrink-0 justify-end">
                            {#if unread}
                                <button
                                    type="button"
                                    class="btn preset-tonal text-sm"
                                    onclick={() => markOneRead(entry.id)}
                                >
                                    Mark as read
                                </button>
                            {:else}
                                <button
                                    type="button"
                                    class="btn preset-tonal text-sm"
                                    onclick={() => markOneUnread(entry.id)}
                                >
                                    Mark as unread
                                </button>
                            {/if}
                        </div>
                    </div>
                    <h2 class="preset-typo-title text-lg {unread ? '' : 'opacity-90'}">{entry.title}</h2>
                    <p class="preset-typo-body-2 {unread ? 'opacity-95' : 'opacity-80'}">{entry.summary}</p>
                    {#if entry.details?.length}
                        <ul class="list-disc pl-5 space-y-1 preset-typo-body-2 {unread ? 'opacity-90' : 'opacity-75'}">
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
