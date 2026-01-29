<script lang="ts">
    import CharacterSelector from "$lib/components/character/CharacterSelector.svelte";
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
        {
            id: "demo-3",
            name: "Thorin Ironforge",
            class: "Paladin",
            level: 3,
            spellSlots: {
                1: { total: 3, used: 3 },
            },
            knownSpells: ["spell-1"],
            preparedSpells: [],
        },
    ];

    let activeCharacterId = $state("demo-1");

    function handleSelectorChange(id: string) {
        activeCharacterId = id;
        console.log("Selector changed to:", id);
    }
</script>

<svelte:head>
    <title>CharacterSelector Demo - D&D Spelltracker</title>
</svelte:head>

<div>
    <div class="mb-8">
        <h1 class="h1 mb-2">CharacterSelector Component</h1>
        <p class="opacity-75">Dropdown selector for choosing an active character</p>
    </div>

    <!-- State: With Characters -->
    <section class="mb-12">
        <div class="card p-6">
            <h2 class="h3 mb-4">State: With Characters</h2>
            <p class="text-sm opacity-75 mb-4">Selector populated with multiple characters. Try changing the selection.</p>
            <div class="max-w-md">
                <CharacterSelector characters={sampleCharacters} {activeCharacterId} onSelect={handleSelectorChange} />
            </div>
        </div>
    </section>

    <!-- State: Empty -->
    <section class="mb-12">
        <div class="card p-6">
            <h2 class="h3 mb-4">State: Empty</h2>
            <p class="text-sm opacity-75 mb-4">Selector when no characters exist yet.</p>
            <div class="max-w-md">
                <CharacterSelector characters={[]} activeCharacterId={null} onSelect={() => {}} />
            </div>
        </div>
    </section>

    <!-- State: Single Character -->
    <section class="mb-12">
        <div class="card p-6">
            <h2 class="h3 mb-4">State: Single Character</h2>
            <p class="text-sm opacity-75 mb-4">Selector with only one character available.</p>
            <div class="max-w-md">
                <CharacterSelector characters={[sampleCharacters[0]]} activeCharacterId={sampleCharacters[0].id} onSelect={() => {}} />
            </div>
        </div>
    </section>

    <!-- State: No Active Selection -->
    <section class="mb-12">
        <div class="card p-6">
            <h2 class="h3 mb-4">State: No Active Selection</h2>
            <p class="text-sm opacity-75 mb-4">Selector with characters but no active character selected.</p>
            <div class="max-w-md">
                <CharacterSelector characters={sampleCharacters} activeCharacterId={null} onSelect={handleSelectorChange} />
            </div>
        </div>
    </section>
</div>
