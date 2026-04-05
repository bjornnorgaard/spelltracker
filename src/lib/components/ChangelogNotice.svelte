<script lang="ts">
    import {resolve} from "$app/paths";
    import {browser} from "$app/environment";
    import {CHANGELOG_ENTRIES} from "$lib/data/changelog";
    import {changelogAck, getChangelogAck} from "$lib/stores/stores";
    import {getLatestChangelogId, getPendingChangelogEntries,} from "$lib/utils/changelog";
    import {Megaphone} from "@lucide/svelte";

    const pending = $derived.by(() => {
        if (!browser) return [];
        changelogAck.current;
        return getPendingChangelogEntries(CHANGELOG_ENTRIES, getChangelogAck().lastAcknowledgedId);
    });

    function acknowledge() {
        const latest = getLatestChangelogId(CHANGELOG_ENTRIES);
        if (latest !== null) {
            changelogAck.current = {lastAcknowledgedId: latest};
        }
    }

    const teaser = $derived.by(() => {
        if (pending.length === 0) return "";
        if (pending.length === 1) return pending[0].summary;
        return `${pending.length} updates since you last checked.`;
    });
</script>

{#if browser && pending.length > 0}
    <div class="m-4 p-4 card preset-outlined-success-500 flex flex-col gap-2">
        <div class="flex gap-4 uppercase tracking-widest text-surface-600-400">
            <Megaphone class="text-success-500" aria-hidden="true"/>
            <span>Unread updates</span>
        </div>
        <p class="preset-typo-body-2 opacity-95">{teaser}</p>
        <div class="flex justify-between">
            <a href={resolve("/changelog")} class="hover:underline text-success-500 text-sm font-medium">View full changelog</a>
            <button onclick={acknowledge} class="text-sm font-medium">Mark all as read</button>
        </div>
    </div>
{/if}
