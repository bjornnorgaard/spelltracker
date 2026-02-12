<script lang="ts">
    import SectionHeader from "$lib/components/SectionHeader.svelte";

    const {title, subtitle, children} = $props();
</script>

<section class="space-y-4">
    <SectionHeader {title} {subtitle}/>
    {@render children()}
</section>
