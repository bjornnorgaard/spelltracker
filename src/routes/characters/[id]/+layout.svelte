<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {characters} from "$lib/stores/stores";
    import {resolve} from "$app/paths";
    import {page} from "$app/state";
    import {formatSpellLevel} from "$lib/utils/spell-formatter";
    import type {Character} from "$lib/types/character";
    import {FilePen, SquareUser, UserRoundPen} from "@lucide/svelte";

    const {children, data} = $props();
    const character = $derived.by(() => characters.current.find((c: Character) => c.id === data.characterId))
</script>

<div class="space-y-8">
    <PageHeader
        title={character.name}
        subtitle={`Your ${formatSpellLevel(character.level)} level ${character.class}`}
        titleHref={`/characters/${data.characterId}`}
        disableTitleLink={page.url.pathname === `/characters/${data.characterId}`}
    >
        {#snippet trailing()}
            <div class="flex gap-4">
                <a href={resolve(`/characters/${data.characterId}`)} class:disabled={`/characters/${data.characterId}` === page.url.pathname}>
                    <SquareUser/>
                </a>
                <a href={resolve(`/characters/${data.characterId}/edit`)} class:disabled={`/characters/${data.characterId}/edit` === page.url.pathname}>
                    <UserRoundPen/>
                </a>
                <a href={resolve(`/characters/${data.characterId}/spells`)} class:disabled={`/characters/${data.characterId}/spells` === page.url.pathname}>
                    <FilePen/>
                </a>
            </div>
        {/snippet}
    </PageHeader>
    {@render children()}
</div>
