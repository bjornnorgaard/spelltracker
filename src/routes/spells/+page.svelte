<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import { spells } from "$lib/stores/stores";
    import type { Spell } from "$lib/types/spell";
    import { DND_CLASSES, SPELL_LEVELS, SPELL_SCHOOLS } from "$lib/utils/constants";
    import { formatSpellLevelLong } from "$lib/utils/spell-formatter";
    import { makeSpellId } from "$lib/utils/spell-import";

    let search = $state("");
    let selectedLevel = $state<string>("all");
    let selectedClass = $state<string>("all");
    let selectedSchool = $state<string>("all");
    let sourceFilter = $state("");
    let onlyWithIssues = $state(false);

    let allSpells = $derived.by<Spell[]>(() => (Array.isArray(spells.current) ? (spells.current as Spell[]) : []));

    function getExpectedId(spell: Spell): string {
        return makeSpellId(spell.name, spell.source);
    }

    function getSpellIssues(spell: Spell): string[] {
        const issues: string[] = [];

        if (!spell.name?.trim()) issues.push("Missing name");
        if (!spell.source?.trim()) issues.push("Missing source");
        if (!spell.page?.trim()) issues.push("Missing page");
        if (!spell.school?.trim()) issues.push("Missing school");
        if (!spell.castingTime?.trim()) issues.push("Missing casting time");
        if (!spell.range?.trim()) issues.push("Missing range");
        if (!spell.duration?.trim()) issues.push("Missing duration");
        if (!spell.components?.trim()) issues.push("Missing components");
        if (!spell.text?.trim()) issues.push("Missing text");
        if (!Array.isArray(spell.classes) || spell.classes.length === 0) issues.push("Missing classes");
        if (spell.id !== getExpectedId(spell)) issues.push("ID mismatch");

        return issues;
    }

    let filteredSpells = $derived.by(() => {
        const normalizedSearch = search.trim().toLowerCase();
        const normalizedSource = sourceFilter.trim().toLowerCase();

        return allSpells
            .filter((spell) => {
                if (selectedLevel !== "all" && spell.level !== Number(selectedLevel)) return false;
                if (selectedClass !== "all" && !spell.classes.includes(selectedClass)) return false;

                if (selectedSchool !== "all") {
                    const normalizedSchool = spell.school.toLowerCase();
                    if (!normalizedSchool.includes(selectedSchool.toLowerCase())) return false;
                }

                if (normalizedSource && !spell.source.toLowerCase().includes(normalizedSource)) return false;

                if (normalizedSearch) {
                    const haystack = [spell.name, spell.source, spell.text, spell.range, spell.duration, spell.components, spell.classes.join(" ")].join(" ").toLowerCase();

                    if (!haystack.includes(normalizedSearch)) return false;
                }

                const issues = getSpellIssues(spell);
                if (onlyWithIssues && issues.length === 0) return false;

                return true;
            })
            .sort((a, b) => {
                if (a.level !== b.level) return a.level - b.level;
                return a.name.localeCompare(b.name);
            });
    });

    let spellsWithIssues = $derived.by(() => allSpells.filter((spell) => getSpellIssues(spell).length > 0));

    function resetFilters() {
        search = "";
        selectedLevel = "all";
        selectedClass = "all";
        selectedSchool = "all";
        sourceFilter = "";
        onlyWithIssues = false;
    }
</script>

<PageHeader title="Spells" subtitle="Search, filter, and validate imported spell data" />

<div class="space-y-4">
    <div class="card preset-tonal p-4 space-y-3">
        <SectionHeader title="Quick Validation" subtitle="Smoke-test your imported spells" />
        <div class="grid gap-2 sm:grid-cols-3">
            <div class="badge preset-filled-surface-500">Total: {allSpells.length}</div>
            <div class="badge preset-filled-surface-500">Filtered: {filteredSpells.length}</div>
            <div class="badge" class:preset-filled-error-500={spellsWithIssues.length > 0} class:preset-filled-success-500={spellsWithIssues.length === 0}>
                With Issues: {spellsWithIssues.length}
            </div>
        </div>
    </div>

    <div class="card preset-tonal p-4 space-y-3">
        <SectionHeader title="Filters" subtitle="Find spells and verify key fields quickly" />

        <label class="label">
            <span class="label-text">Search</span>
            <input class="input" type="text" bind:value={search} placeholder="Name, text, class, range, source..." />
        </label>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label class="label">
                <span class="label-text">Level</span>
                <select class="select" bind:value={selectedLevel}>
                    <option value="all">All levels</option>
                    {#each SPELL_LEVELS as level (level)}
                        <option value={String(level)}>{formatSpellLevelLong(level)}</option>
                    {/each}
                </select>
            </label>

            <label class="label">
                <span class="label-text">Class</span>
                <select class="select" bind:value={selectedClass}>
                    <option value="all">All classes</option>
                    {#each DND_CLASSES as dndClass (dndClass)}
                        <option value={dndClass}>{dndClass}</option>
                    {/each}
                </select>
            </label>

            <label class="label">
                <span class="label-text">School</span>
                <select class="select" bind:value={selectedSchool}>
                    <option value="all">All schools</option>
                    {#each SPELL_SCHOOLS as school (school)}
                        <option value={school}>{school}</option>
                    {/each}
                </select>
            </label>

            <label class="label">
                <span class="label-text">Source contains</span>
                <input class="input" type="text" bind:value={sourceFilter} placeholder="PHB, XGE, TCE..." />
            </label>
        </div>

        <div class="flex flex-wrap gap-3 items-center">
            <label class="flex items-center gap-2">
                <input class="checkbox" type="checkbox" bind:checked={onlyWithIssues} />
                <span>Only show spells with issues</span>
            </label>
            <button class="btn preset-tonal" onclick={resetFilters}>Reset Filters</button>
            <button class="btn preset-filled-primary-500 sm:ml-auto" onclick={() => (window.location.href = "/spells/import")}>Import Spells</button>
        </div>
    </div>

    <div class="card preset-filled-surface-100-900 p-4 space-y-3">
        <SectionHeader title="Spell Results" subtitle="Use issue tags to validate imported data quality" />

        {#if filteredSpells.length === 0}
            <p class="opacity-80">No spells match your current filters.</p>
        {:else}
            <div class="space-y-3">
                {#each filteredSpells as spell (spell.id)}
                    {@const issues = getSpellIssues(spell)}
                    <div class="card preset-tonal p-3 space-y-2">
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <div class="font-bold text-lg">{spell.name}</div>
                            <div class="flex flex-wrap gap-2">
                                <span class="badge preset-filled-surface-500">{formatSpellLevelLong(spell.level)}</span>
                                <span class="badge preset-filled-surface-500">{spell.source}</span>
                                {#if issues.length > 0}
                                    <span class="badge preset-filled-error-500">{issues.length} issue(s)</span>
                                {:else}
                                    <span class="badge preset-filled-success-500">OK</span>
                                {/if}
                            </div>
                        </div>

                        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                            <p><strong>ID:</strong> {spell.id}</p>
                            <p><strong>Expected ID:</strong> {getExpectedId(spell)}</p>
                            <p><strong>Page:</strong> {spell.page || "—"}</p>
                            <p><strong>School:</strong> {spell.school || "—"}</p>
                            <p><strong>Casting:</strong> {spell.castingTime || "—"}</p>
                            <p><strong>Duration:</strong> {spell.duration || "—"}</p>
                            <p><strong>Range:</strong> {spell.range || "—"}</p>
                            <p><strong>Components:</strong> {spell.components || "—"}</p>
                            <p><strong>Classes:</strong> {spell.classes?.join(", ") || "—"}</p>
                        </div>

                        {#if issues.length > 0}
                            <div class="space-y-1">
                                <p class="font-semibold text-error-500">Issues</p>
                                <ul class="list-disc pl-5 text-sm">
                                    {#each issues as issue (issue)}
                                        <li>{issue}</li>
                                    {/each}
                                </ul>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
