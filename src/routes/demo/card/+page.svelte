<script lang="ts">
    import CharacterCard from "$lib/components/character/CharacterCard.svelte";
    import type { Character } from "$lib/types/character";

    // Sample characters demonstrating various states
    const characters = {
        highLevel: {
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
        midLevel: {
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
        lowLevel: {
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
        maxLevel: {
            id: "demo-4",
            name: "Lyra Starweaver",
            class: "Sorcerer",
            level: 20,
            spellSlots: {
                1: { total: 4, used: 0 },
                2: { total: 3, used: 0 },
                3: { total: 3, used: 0 },
                4: { total: 3, used: 0 },
                5: { total: 3, used: 0 },
                6: { total: 2, used: 0 },
                7: { total: 2, used: 0 },
                8: { total: 1, used: 0 },
                9: { total: 1, used: 0 },
            },
            knownSpells: Array(35).fill("spell"),
            preparedSpells: [],
        },
        noSpells: {
            id: "demo-5",
            name: "Conan the Barbarian",
            class: "Fighter",
            level: 10,
            spellSlots: {},
            knownSpells: [],
            preparedSpells: [],
        },
        levelOne: {
            id: "demo-6",
            name: "Fresh Adventurer",
            class: "Bard",
            level: 1,
            spellSlots: {
                1: { total: 2, used: 0 },
            },
            knownSpells: ["spell-1", "spell-2"],
            preparedSpells: [],
        },
    } satisfies Record<string, Character>;

    function handleSelect(id: string) {
        console.log("Selected:", id);
    }

    function handleEdit(id: string) {
        console.log("Edit:", id);
    }

    function handleDelete(id: string) {
        console.log("Delete:", id);
    }
</script>

<svelte:head>
    <title>CharacterCard Demo - D&D Spelltracker</title>
</svelte:head>

<div>
    <div class="mb-8">
        <h1 class="h1 mb-2">CharacterCard Component</h1>
        <p class="opacity-75">Display card for character with stats and actions</p>
    </div>

    <!-- Active vs Inactive -->
    <section class="mb-12">
        <h2 class="h2 mb-4">Character Card States</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">With Actions</h3>
                <CharacterCard character={characters.highLevel} onSelect={handleSelect} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Without Actions</h3>
                <CharacterCard character={characters.highLevel} />
            </div>
        </div>
    </section>

    <!-- Character Levels -->
    <section class="mb-12">
        <h2 class="h2 mb-4">Different Character Levels</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Level 1</h3>
                <CharacterCard character={characters.levelOne} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Level 3 (Low)</h3>
                <CharacterCard character={characters.lowLevel} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Level 8 (Mid)</h3>
                <CharacterCard character={characters.midLevel} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Level 15 (High)</h3>
                <CharacterCard character={characters.highLevel} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Level 20 (Max)</h3>
                <CharacterCard character={characters.maxLevel} onSelect={handleSelect} />
            </div>
        </div>
    </section>

    <!-- Spell Slot States -->
    <section class="mb-12">
        <h2 class="h2 mb-4">Spell Slot States</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">All Slots Available</h3>
                <CharacterCard character={characters.maxLevel} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Some Slots Used</h3>
                <CharacterCard character={characters.midLevel} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">All Slots Used</h3>
                <CharacterCard character={characters.lowLevel} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">No Spell Slots</h3>
                <CharacterCard character={characters.noSpells} onSelect={handleSelect} />
            </div>
        </div>
    </section>

    <!-- Action Button Variations -->
    <section class="mb-12">
        <h2 class="h2 mb-4">Action Button Variations</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">All Actions</h3>
                <CharacterCard character={characters.midLevel} onSelect={handleSelect} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Select Only</h3>
                <CharacterCard character={characters.midLevel} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Edit & Delete Only</h3>
                <CharacterCard character={characters.midLevel} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">No Actions</h3>
                <CharacterCard character={characters.midLevel} />
            </div>
        </div>
    </section>

    <!-- Edge Cases -->
    <section class="mb-12">
        <h2 class="h2 mb-4">Edge Cases</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">Many Spells (35+)</h3>
                <CharacterCard character={characters.maxLevel} onSelect={handleSelect} />
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase mb-2 opacity-75">No Spells</h3>
                <CharacterCard character={characters.noSpells} onSelect={handleSelect} />
            </div>
        </div>
    </section>
</div>
