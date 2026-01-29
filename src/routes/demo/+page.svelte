<script lang="ts">
    import CharacterCard from "$lib/components/character/CharacterCard.svelte";
    import type { Character } from "$lib/types/character";

    // Sample characters for demo
    const sampleCharacters: Character[] = [
        {
            id: "demo-1",
            name: "Gandalf the Grey",
            class: "Wizard",
            level: 15,
            spellSlots: {
                1: { total: 4, used: 1 },
                2: { total: 3, used: 0 },
                3: { total: 3, used: 2 },
                4: { total: 3, used: 3 },
                5: { total: 2, used: 1 },
                6: { total: 1, used: 0 },
                7: { total: 1, used: 1 },
                8: { total: 1, used: 0 },
            },
            knownSpells: ["spell-1", "spell-2", "spell-3", "spell-4", "spell-5"],
            preparedSpells: ["spell-1", "spell-2", "spell-3"],
        },
        {
            id: "demo-2",
            name: "Elara Moonwhisper",
            class: "Cleric",
            level: 8,
            spellSlots: {
                1: { total: 4, used: 2 },
                2: { total: 3, used: 1 },
                3: { total: 3, used: 0 },
                4: { total: 2, used: 0 },
            },
            knownSpells: ["spell-1", "spell-2", "spell-3"],
            preparedSpells: ["spell-1", "spell-2"],
        },
    ];

    const components = [
        {
            name: "CharacterSelector",
            description: "Dropdown selector for choosing an active character",
            href: "/demo/selector",
            states: ["Empty", "With Characters", "Single Character", "No Active Selection"],
        },
        {
            name: "CharacterCard",
            description: "Display card showing character stats, spell slots, and actions",
            href: "/demo/card",
            states: ["Active/Inactive", "Different Levels", "Spell Slot States", "Action Variations"],
        },
        {
            name: "CharacterForm",
            description: "Form for creating new characters or editing existing ones",
            href: "/demo/form",
            states: ["Create Mode", "Edit Mode", "Validation"],
        },
    ];
</script>

<svelte:head>
    <title>Component Demo Overview - D&D Spelltracker</title>
</svelte:head>

<div>
    <div class="mb-8">
        <h1 class="h1 mb-2">Component Demo</h1>
        <p class="opacity-75">Visual showcase of all character management components</p>
        <div class="card p-4 mt-4 preset-tonal-primary">
            <p class="text-sm">
                <strong>Welcome!</strong> Use the navigation above to explore each component in detail. All interactions are logged to the browser console.
            </p>
        </div>
    </div>

    <!-- Quick Preview Grid -->
    <section class="mb-12">
        <h2 class="h2 mb-6">Quick Preview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each sampleCharacters.slice(0, 2) as character}
                <CharacterCard {character} />
            {/each}
        </div>
    </section>

    <!-- Component Navigation Cards -->
    <section class="mb-12">
        <h2 class="h2 mb-6">Available Components</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            {#each components as component}
                <a href={component.href} class="card p-6 hover:preset-tonal transition-all">
                    <h3 class="h3 mb-2">{component.name}</h3>
                    <p class="text-sm opacity-75 mb-4">{component.description}</p>
                    <div class="space-y-1">
                        <p class="text-xs font-semibold uppercase opacity-50">States Demonstrated:</p>
                        <ul class="text-xs opacity-75 space-y-1">
                            {#each component.states as state}
                                <li>• {state}</li>
                            {/each}
                        </ul>
                    </div>
                    <div class="mt-4 text-sm text-primary-500">View Details →</div>
                </a>
            {/each}
        </div>
    </section>

    <!-- Development Info -->
    <section class="mb-12">
        <div class="card p-6 preset-tonal-surface">
            <h3 class="h3 mb-3">About This Demo</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm opacity-75">
                <div>
                    <h4 class="font-semibold mb-2">Purpose</h4>
                    <p>This demo area allows visual inspection of all character management components in isolation with various states and configurations.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Usage</h4>
                    <p>Each component page demonstrates different states, edge cases, and prop combinations. Check the browser console to see interaction logs.</p>
                </div>
            </div>
        </div>
    </section>
</div>
