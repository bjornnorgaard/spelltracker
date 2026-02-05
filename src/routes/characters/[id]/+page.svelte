<script lang="ts">
    import {DND_CLASSES} from "$lib/utils/constants";
    import {app} from "$lib/stores/app.svelte";
    import {goto} from "$app/navigation";
    import {formatSpellLevel, formatSpellLevelLong} from "$lib/utils/spell-formatter";

    const {data} = $props();

    async function deleteCharacter() {
        app.current.characters = app.current.characters.filter((c: any) => c.id !== data.character.id);
        await goto("/");
    }

</script>

<div class="space-y-4">
    {#if data.character}
        {@const c = data.character}

        <label class="label">
            <span class="label-text">Name</span>
            <input type="text" class="input" autocomplete="off" bind:value={c.name} placeholder="Sir Hack'a'lot"
                   required>
        </label>

        <label class="label">
            <span class="label-text">Level</span>
            <input type="number" min={1} max={20} class="input" bind:value={c.level} required>
        </label>

        <label class="label">
            <span class="label-text">Class</span>
            <select class="select" bind:value={c.class} required>
                {#each DND_CLASSES as c}
                    <option value={c}>{c}</option>
                {/each}
            </select>
        </label>

        <div class="flex flex-col gap-4">
            {#each c.spellSlots.filter(s => s.level !== 0) as s}
                <div class="flex justify-between items-center">
                    <button class="btn btn-sm preset-filled-warning-500" onclick={() => s.total--}>Less</button>
                    <button class="btn btn-sm preset-filled-warning-500" onclick={() => s.used--}>Restore</button>
                    <span class="badge preset-filled">{formatSpellLevelLong(s.level)}</span>
                    <span class="badge preset-filled">Used {s.used}/{s.total} Total</span>
                    <button class="btn btn-sm preset-filled-success-500" onclick={() => s.used++}>Use</button>
                    <button class="btn btn-sm preset-filled-success-500" onclick={() => s.total++}>More</button>
                </div>
                <div class="flex gap-4 justify-between">
                    {#each Array(s.total) as _, i}
                        <button class="btn btn-sm grow"
                                class:preset-filled-primary-500={i >= s.used}>
                            {formatSpellLevel(s.level)} {i}
                        </button>
                    {/each}
                </div>
            {/each}
        </div>

        <button class="btn" onclick={() => deleteCharacter()}>Delete Character</button>
    {/if}
</div>
