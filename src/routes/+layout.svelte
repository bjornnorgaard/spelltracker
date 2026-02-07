<script lang="ts">
    import "./layout.css";

    let {children} = $props();
</script>

<main class="mx-auto p-4 min-h-screen">
    {@render children()}
</main>

<footer>
    <div class="flex justify-center items-center py-16 preset-filled-surface-200-800">
        <p class="text-sm">Spell Tracker By Bear</p>
    </div>
</footer>