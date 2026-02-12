<script lang="ts">
    import "./layout.css";
    import { characters, spells } from "$lib/stores/stores";
    import { onMount } from "svelte";
    import { DND_CLASSES } from "$lib/utils/constants";
    import type { Character } from "$lib/types/character";

    let { children } = $props();

    function normalizeCharacter(input: Partial<Character>): Character {
        const preparedSpellsLimit = Number((input as any)?.preparedSpellsLimit ?? (input as any)?.preparedLimit ?? 1);
        const legacySpellIds = Array.isArray((input as any)?.spellIds) ? ((input as any).spellIds as string[]) : [];
        const preparedSpellIds = Array.isArray(input?.preparedSpellIds) ? input.preparedSpellIds : [];
        const alwaysPreparedSpellIds = Array.isArray(input?.alwaysPreparedSpellIds) ? input.alwaysPreparedSpellIds : [];
        const freePerLongRestSpells = Array.isArray((input as any)?.freePerLongRestSpells)
            ? (input as any).freePerLongRestSpells.map((entry: any) => ({
                  spellId: String(entry?.spellId ?? ""),
                  total: Number(entry?.total ?? entry?.count ?? 0),
                  used: Number(entry?.used ?? 0),
                  why: String(entry?.why ?? ""),
              }))
            : [];
        const freePerShortRestSpells = Array.isArray((input as any)?.freePerShortRestSpells)
            ? (input as any).freePerShortRestSpells.map((entry: any) => ({
                  spellId: String(entry?.spellId ?? ""),
                  total: Number(entry?.total ?? entry?.count ?? 0),
                  used: Number(entry?.used ?? 0),
                  why: String(entry?.why ?? ""),
              }))
            : [];
        const spellNotes = Array.isArray(input?.spellNotes) ? input.spellNotes : [];
        const derivedSelectedSpellIds = [
            ...legacySpellIds,
            ...preparedSpellIds,
            ...alwaysPreparedSpellIds,
            ...freePerLongRestSpells.map((entry: any) => entry.spellId),
            ...freePerShortRestSpells.map((entry: any) => entry.spellId),
            ...spellNotes.map((entry: any) => entry.spellId),
            ...(input?.concentrationSpellId ? [input.concentrationSpellId] : []),
        ].filter(Boolean);
        const selectedSpellIds = Array.isArray((input as any)?.selectedSpellIds) ? ((input as any).selectedSpellIds as string[]) : derivedSelectedSpellIds;

        return {
            id: String(input?.id ?? crypto.randomUUID()),
            name: String(input?.name ?? "John Doe"),
            class: String(input?.class ?? DND_CLASSES[0]),
            level: Number(input?.level ?? 1),
            spellSlots: Array.isArray(input?.spellSlots) ? input.spellSlots : [],
            spellNotes,
            selectedSpellIds: [...new Set(selectedSpellIds)],
            preparedSpellIds: [...new Set(preparedSpellIds)],
            preparedSpellsLimit: Number.isFinite(preparedSpellsLimit) ? preparedSpellsLimit : 1,
            alwaysPreparedSpellIds: [...new Set(alwaysPreparedSpellIds)],
            concentrationSpellId: input?.concentrationSpellId === undefined || input?.concentrationSpellId === "" ? null : input.concentrationSpellId,
            freePerLongRestSpells,
            freePerShortRestSpells,
        };
    }

    onMount(() => {
        const rawLegacy = localStorage.getItem("spelltracker");
        if (rawLegacy) {
            try {
                const legacy = JSON.parse(rawLegacy) as { spells?: unknown[]; characters?: Partial<Character>[] };
                if ((spells.current?.length ?? 0) === 0 && Array.isArray(legacy?.spells)) {
                    spells.current = legacy.spells as any;
                }
                if ((characters.current?.length ?? 0) === 0 && Array.isArray(legacy?.characters)) {
                    characters.current = legacy.characters.map(normalizeCharacter);
                }
            } catch {}
        }

        characters.current = (characters.current ?? []).map((character: Partial<Character>) => normalizeCharacter(character));
    });
</script>

<div class="min-h-screen flex flex-col">
    <header class="p-4">
        <button class="anchor text-left" onclick={() => (window.location.href = "/")}>
            <p class="preset-typo-headline">Spelltracker <span class="opacity-25 font-serif font-thin ml-1">by Bear</span></p>
        </button>
    </header>

    <main class="mx-auto max-w-xl p-4 flex-1 w-full">
        {@render children()}
    </main>

    <footer class="opacity-70 preset-filled-surface-100-900 pb-4 space-y-4">
        <div class="p-4 sm:p-8 md:px-16 lg:max-w-7xl mx-auto">
            <div>
                <p class="preset-typo-body-2">Spelltracker by Bear</p>
                <p class="preset-typo-caption">Manage spells and spell-slots.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 my-8">
                <div class="space-y-2">
                    <p class="uppercase text-xs tracking-widest">General</p>
                    <ul class="space-y-1">
                        <li><button class="anchor" onclick={() => (window.location.href = "/")}>Home</button></li>
                        <li><button class="anchor" onclick={() => (window.location.href = "/backup")}>Backup</button></li>
                        <li><button class="anchor" onclick={() => (window.location.href = "/settings")}>Settings</button></li>
                        <li><button class="anchor" onclick={() => (window.location.href = "/debug")}>Debug</button></li>
                    </ul>
                </div>

                <div class="space-y-2">
                    <p class="uppercase text-xs tracking-widest">Spells</p>
                    <ul class="space-y-1">
                        <li><button class="anchor" onclick={() => (window.location.href = "/spells")}>Browse &amp; Filter</button></li>
                        <li><button class="anchor" onclick={() => (window.location.href = "/spells/import")}>Import Spells</button></li>
                    </ul>
                </div>

                <div class="space-y-2">
                    <p class="uppercase tracking-widest text-xs">Characters</p>
                    <ul class="space-y-1">
                        {#if (characters.current ?? []).length > 0}
                            {#each characters.current ?? [] as c (c.id)}
                                <li><button class="anchor" onclick={() => (window.location.href = `/characters/${c.id}`)}>{c.name}</button></li>
                            {/each}
                        {:else}
                            <li class="text-surface-500-200">No characters yet</li>
                        {/if}
                    </ul>
                </div>
            </div>
            <div class="flex items-center justify-between preset-typo-caption">
                <span>For D&D 5th Edition Spellcasters</span>
            </div>
        </div>
    </footer>
</div>
