<script lang="ts">
    import ConcentrationWarningDialog from "$lib/components/ConcentrationWarningDialog.svelte";
    import type { Spell } from "$lib/types/spell";

    // Mock spell data for testing
    const currentSpell: Spell = {
        id: "current-spell",
        name: "Bless",
        source: "PHB",
        page: "219",
        level: 1,
        castingTime: "1 action",
        duration: "Concentration, up to 1 minute",
        school: "Enchantment",
        range: "30 feet",
        components: "V, S, M (a sprinkling of holy water)",
        classes: ["Cleric", "Paladin"],
        text: "You bless up to three creatures of your choice within range.",
        atHigherLevels: "When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.",
    };

    const newSpell: Spell = {
        id: "new-spell",
        name: "Hold Person",
        source: "PHB",
        page: "251",
        level: 2,
        castingTime: "1 action",
        duration: "Concentration, up to 1 minute",
        school: "Enchantment",
        range: "60 feet",
        components: "V, S, M (a small, straight piece of iron)",
        classes: ["Bard", "Cleric", "Druid", "Sorcerer", "Warlock", "Wizard"],
        text: "Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration.",
        atHigherLevels: "When you cast this spell using a spell slot of 3rd level or higher, you can target one additional humanoid for each slot level above 2nd.",
    };

    let showDialog = $state(true);
    let hasCurrentSpell = $state(true);
    let hasNewSpell = $state(true);
</script>

<div class="container mx-auto p-8 space-y-8">
    <div class="card preset-filled-surface-100-900 p-6 space-y-4">
        <h1 class="text-3xl font-bold">Concentration Warning Dialog Debug</h1>
        <p class="opacity-70">This page shows the ConcentrationWarningDialog component for styling and template adjustments.</p>

        <div class="flex gap-4">
            <button class="btn preset-filled-primary-500" onclick={() => (showDialog = true)}> Show Dialog </button>
            <button class="btn preset-tonal" onclick={() => location.reload()}> Reload Page </button>
        </div>
    </div>

    <div class="card preset-filled-surface-100-900 p-6 space-y-4">
        <h2 class="text-xl font-bold">Dialog Scenarios</h2>
        <div class="space-y-2">
            <label class="flex items-center gap-2">
                <input type="checkbox" class="checkbox" bind:checked={hasCurrentSpell} />
                <span>Show current concentration spell (breaking concentration scenario)</span>
            </label>
            <label class="flex items-center gap-2">
                <input type="checkbox" class="checkbox" bind:checked={hasNewSpell} />
                <span>Show new spell</span>
            </label>
        </div>
        <p class="text-sm opacity-70">Toggle these to test different scenarios:</p>
        <ul class="list-disc list-inside ml-4 text-sm opacity-70">
            <li>Both checked: Shows breaking concentration warning</li>
            <li>Only new spell: Shows first concentration warning</li>
        </ul>
    </div>

    <div class="card preset-filled-surface-100-900 p-6 space-y-4">
        <h2 class="text-xl font-bold">Mock Spell Data</h2>
        <div class="space-y-4">
            <div>
                <h3 class="font-bold mb-2">Current Spell</h3>
                <pre class="text-xs overflow-auto"><code>{JSON.stringify(currentSpell, null, 2)}</code></pre>
            </div>
            <div>
                <h3 class="font-bold mb-2">New Spell</h3>
                <pre class="text-xs overflow-auto"><code>{JSON.stringify(newSpell, null, 2)}</code></pre>
            </div>
        </div>
    </div>

    <div class="card preset-filled-surface-100-900 p-6 space-y-4">
        <h2 class="text-xl font-bold">Instructions</h2>
        <ul class="list-disc list-inside space-y-2">
            <li>Click "Show Dialog" to open the warning dialog</li>
            <li>Use checkboxes above to test different scenarios</li>
            <li>Edit the component file and save to see live updates</li>
            <li>Check console for button click events</li>
        </ul>
    </div>
</div>

<ConcentrationWarningDialog
    bind:open={showDialog}
    currentSpell={hasCurrentSpell ? currentSpell : null}
    newSpell={hasNewSpell ? newSpell : null}
    onConfirm={() => {
        console.log("Confirm clicked");
        showDialog = false;
    }}
    onCancel={() => {
        console.log("Cancel clicked");
        showDialog = false;
    }} />
