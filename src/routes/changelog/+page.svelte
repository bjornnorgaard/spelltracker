<script lang="ts">
    import {resolve} from "$app/paths";
    import {Accordion} from "@skeletonlabs/skeleton-svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {CHANGELOG_ENTRIES} from "$lib/data/changelog";
    import {changelogAck, getChangelogAck} from "$lib/stores/stores";
    import {getChangelogEntriesNewestFirst, getShippedEntryIds, isChangelogEntryUnread, withEntryMarkedRead, withEntryMarkedUnread,} from "$lib/utils/changelog";
    import {Megaphone} from "@lucide/svelte";
    import {slide} from "svelte/transition";
    import {untrack} from "svelte";

    const entries = getChangelogEntriesNewestFirst(CHANGELOG_ENTRIES);

    const readEntryIds = $derived.by(() => {
        changelogAck.current;
        return getChangelogAck().readEntryIds;
    });

    const hasUnread = $derived.by(() => entries.some((e) => isChangelogEntryUnread(e.id, readEntryIds)));

    /** Which accordion items are expanded. Synced when read/unread changes; user toggles preserved otherwise. */
    let openIds = $state<string[]>([]);
    let unreadSnapshot = $state<string[] | null>(null);

    /**
     * Sync accordion open state when read/unread changes. Reads `openIds` / `unreadSnapshot` via
     * `untrack` so assigning them does not retrigger this effect (avoids effect_update_depth_exceeded).
     */
    $effect(() => {
        readEntryIds;
        entries;
        const unreadIds = entries
            .filter((e) => isChangelogEntryUnread(e.id, readEntryIds))
            .map((e) => e.id);

        untrack(() => {
            const priorUnread = unreadSnapshot;
            if (priorUnread === null) {
                openIds = [...unreadIds];
                unreadSnapshot = [...unreadIds];
                return;
            }

            const becameRead = priorUnread.filter((id) => !unreadIds.includes(id));
            const becameUnread = unreadIds.filter((id) => !priorUnread.includes(id));
            const currentOpen = openIds;
            openIds = [
                ...currentOpen.filter((id) => !becameRead.includes(id)),
                ...becameUnread.filter((id) => !currentOpen.includes(id)),
            ];
            unreadSnapshot = [...unreadIds];
        });
    });

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
        subtitle="Release notes for Spelltracker. Newest first. Unread entries start expanded."
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

        <Accordion
            collapsible
            value={openIds}
            onValueChange={(details) => (openIds = details.value)}
            class="space-y-4"
        >
            {#each entries as entry (entry.id)}
                {@const unread = isChangelogEntryUnread(entry.id, readEntryIds)}
                <Accordion.Item
                    value={entry.id}
                    class="card overflow-hidden {unread
                        ? 'preset-outlined-success-500'
                        : 'border border-surface-200-800 opacity-75 text-surface-600-400'}"
                >
                    <Accordion.ItemTrigger
                        class="w-full text-left p-4 flex flex-col gap-3 data-[state=open]:border-b data-[state=open]:border-surface-200-800"
                    >
                        <div class="flex flex-wrap items-start justify-between gap-3 w-full">
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
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            markOneRead(entry.id);
                                        }}
                                    >
                                        Mark as read
                                    </button>
                                {:else}
                                    <button
                                        type="button"
                                        class="btn preset-tonal text-sm"
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            markOneUnread(entry.id);
                                        }}
                                    >
                                        Mark as unread
                                    </button>
                                {/if}
                            </div>
                        </div>
                        <h2 class="preset-typo-title text-lg text-left w-full {unread ? '' : 'opacity-90'}">
                            {entry.title}
                        </h2>
                        <p class="preset-typo-body-2 text-left w-full {unread ? 'opacity-95' : 'opacity-80'}">
                            {entry.summary}
                        </p>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        {#snippet element(attributes)}
                            {#if !attributes.hidden}
                                <div
                                    {...attributes}
                                    class="px-4 pb-4 pt-0"
                                    transition:slide={{duration: 180}}
                                >
                                    {#if entry.details?.length}
                                        <ul
                                            class="list-disc pl-5 space-y-2 preset-typo-body-2 text-left {unread
                                                ? 'opacity-90'
                                                : 'opacity-75'}"
                                        >
                                            {#each entry.details as line (line)}
                                                <li>{line}</li>
                                            {/each}
                                        </ul>
                                    {:else}
                                        <p class="preset-typo-caption opacity-70">No extra details.</p>
                                    {/if}
                                </div>
                            {/if}
                        {/snippet}
                    </Accordion.ItemContent>
                </Accordion.Item>
            {/each}
        </Accordion>
    {/if}

    <p class="preset-typo-caption">
        <a href={resolve("/")} class="anchor">Back to home</a>
    </p>
</div>
