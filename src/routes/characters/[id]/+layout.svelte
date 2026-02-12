<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {characters} from "$lib/stores/stores";
    import {formatSpellLevel} from "$lib/utils/spell-formatter";
    import type {Character} from "$lib/types/character";

    const {children, data} = $props();
    const character = $derived.by(() => characters.current.find((c: Character) => c.id === data.characterId))
</script>

<div class="space-y-8">
    <PageHeader title={character.name} subtitle={`Your ${formatSpellLevel(character.level)} level ${character.class}`}/>
    {@render children()}
</div>
