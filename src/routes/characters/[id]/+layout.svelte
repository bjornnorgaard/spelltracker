<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {characters} from "$lib/stores/stores";
    import {page} from "$app/state";
    import {formatSpellLevel} from "$lib/utils/spell-formatter";
    import type {Character} from "$lib/types/character";
    import {FilePen, SquareUser, UserRoundPen} from "@lucide/svelte";

    const {children, data} = $props();
    const character = $derived.by(() => characters.current.find((c: Character) => c.id === data.characterId))
</script>

<div class="space-y-8">
    <PageHeader title={character.name} subtitle={`Your ${formatSpellLevel(character.level)} level ${character.class}`}>
        {#snippet trailing()}
            <div class="flex gap-4">
                <a href={`/characters/${data.characterId}`} class:disabled={`/characters/${data.characterId}` === page.url.pathname}>
                    <SquareUser/>
                </a>
                <a href={`/characters/${data.characterId}/edit`} class:disabled={`/characters/${data.characterId}/edit` === page.url.pathname}>
                    <UserRoundPen/>
                </a>
                <a href={`/characters/${data.characterId}/spells`} class:disabled={`/characters/${data.characterId}/spells` === page.url.pathname}>
                    <FilePen/>
                </a>
            </div>
        {/snippet}
    </PageHeader>
    {@render children()}
</div>
