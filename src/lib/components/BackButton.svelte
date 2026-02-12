<script lang="ts">
    import {ArrowLeft} from "@lucide/svelte";

    function goBack() {
        window.history.back();
    }
</script>

<button class="flex gap-2 items-center" onclick={goBack}>
    <ArrowLeft/>
    Back
</button>