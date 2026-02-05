<script lang="ts">
    import "./layout.css";
    import {app} from "$lib/stores/app.svelte";

    let {children} = $props();
</script>

<div class="p-4 space-y-4">

    <header class="flex justify-center">
        <a href="/">
            <h1 class="h1">Spell Tracker By Bear</h1>
        </a>
    </header>

    <main class="mx-auto py-4">
        {@render children()}
    </main>
</div>
