<script lang="ts">
    import CharacterForm from "$lib/components/character/CharacterForm.svelte";
    import type { Character } from "$lib/types/character";

    const sampleCharacter: Character = {
        id: "demo-1",
        name: "Gandalf the Grey",
        class: "Wizard",
        level: 15,
        spellSlots: {
            1: { total: 4, used: 1 },
            2: { total: 3, used: 0 },
            3: { total: 3, used: 2 },
        },
        knownSpells: ["spell-1", "spell-2", "spell-3"],
        preparedSpells: ["spell-1", "spell-2"],
    };

    function handleSubmit(data: Omit<Character, "id">) {
        console.log("Form submitted:", data);
    }

    function handleCancel() {
        console.log("Form cancelled");
    }
</script>

<svelte:head>
    <title>CharacterForm Demo - D&D Spelltracker</title>
</svelte:head>

<div>
    <div class="mb-8">
        <h1 class="h1 mb-2">CharacterForm Component</h1>
        <p class="opacity-75">Form for creating or editing characters</p>
    </div>

    <!-- Create Mode -->
    <section class="mb-12">
        <div class="card p-6">
            <h2 class="h3 mb-4">State: Create Mode</h2>
            <p class="text-sm opacity-75 mb-4">Form with empty fields for creating a new character.</p>
            <div class="max-w-2xl">
                <CharacterForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
        </div>
    </section>

    <!-- Edit Mode -->
    <section class="mb-12">
        <div class="card p-6">
            <h2 class="h3 mb-4">State: Edit Mode</h2>
            <p class="text-sm opacity-75 mb-4">Form pre-filled with existing character data for editing.</p>
            <div class="max-w-2xl">
                <CharacterForm character={sampleCharacter} onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
        </div>
    </section>

    <!-- Side by Side Comparison -->
    <section class="mb-12">
        <h2 class="h2 mb-4">Side by Side Comparison</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card p-6">
                <h3 class="h4 mb-4">Create Mode</h3>
                <CharacterForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
            <div class="card p-6">
                <h3 class="h4 mb-4">Edit Mode</h3>
                <CharacterForm character={sampleCharacter} onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
        </div>
    </section>

    <!-- Form Validation Notes -->
    <section class="mb-12">
        <div class="card preset-tonal-warning p-6">
            <h3 class="h4 mb-2">Testing Notes</h3>
            <ul class="list-disc list-inside space-y-1 text-sm opacity-75">
                <li>All fields are required - form won't submit with empty fields</li>
                <li>Character name must have at least one non-whitespace character</li>
                <li>Level must be between 1 and 20</li>
                <li>Class must be selected from the dropdown</li>
                <li>Submit and Cancel buttons trigger console logs</li>
            </ul>
        </div>
    </section>
</div>
