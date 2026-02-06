<script lang="ts">
    import "./layout.css";

    let {children} = $props();
</script>

<main class="mx-auto p-4 min-h-screen">
    {@render children()}
</main>
