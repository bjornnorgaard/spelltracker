<script lang="ts">
    import { formatSpellLevel } from "$lib/utils/spell-formatter";

    let { character, index = 0, showLink = false } = $props();
</script>

<div class="card preset-filled-primary-50-950 p-4" style={`filter: hue-rotate(${index * 30}deg)`}>
    <p class="preset-typo-title">{character.name}</p>
    <p class="preset-typo-subtitle">{formatSpellLevel(character.level)} Level {character.class}</p>
    <div class="flex justify-between">
        <span>{character.preparedSpellsLimit} prepared</span>
        {#if showLink}
            <a href={`/characters/${character.id}`} class="anchor">View character</a>
        {/if}
    </div>
</div>
