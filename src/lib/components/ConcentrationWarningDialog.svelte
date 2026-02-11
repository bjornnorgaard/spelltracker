<script lang="ts">
    import {Dialog, Portal} from "@skeletonlabs/skeleton-svelte";
    import {CircleAlert,} from "@lucide/svelte";
    import type {Spell} from "$lib/types/spell";

    interface Props {
        open: boolean;
        currentSpell: Spell | null;
        newSpell: Spell | null;
        onConfirm: () => void;
        onCancel: () => void;
    }

    let {open = $bindable(false), currentSpell, newSpell, onConfirm, onCancel}: Props = $props();

    const animation =
        "transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0";
</script>

<Dialog {open} onOpenChange={(details) => (open = details.open)}>
    <Portal>
        <Dialog.Backdrop class="fixed inset-0 z-40 bg-black opacity-70"/>
        <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-2">
            <Dialog.Content class="card bg-surface-100-900 border-2 border-surface-200-800 w-full p-4 space-y-4 {animation}">
                <header class="flex items-center gap-3">
                    <CircleAlert class="text-warning-500" size={32}/>
                    <Dialog.Title class="text-xl font-bold">Concentration Warning</Dialog.Title>
                </header>
                <Dialog.Description class="space-y-3">
                    {#if currentSpell && newSpell}
                        <p>You are already concentrating on <strong>{currentSpell.name}</strong>. Casting <strong>{newSpell.name}</strong> will break your concentration on the previous spell.</p>
                    {:else if newSpell}
                        <strong>{newSpell.name}</strong> requires concentration. You can only concentrate on one spell at a time.
                    {/if}
                    <p class="text-sm opacity-70">Do you want to continue casting this spell?</p>
                </Dialog.Description>
                <footer class="flex justify-end gap-2">
                    <button type="button" class="btn grow preset-tonal" onclick={onCancel}> Cancel</button>
                    <button type="button" class="btn grow preset-filled-warning-500" onclick={onConfirm}>
                        {currentSpell ? "Break Concentration & Cast" : "Cast Spell"}
                    </button>
                </footer>
            </Dialog.Content>
        </Dialog.Positioner>
    </Portal>
</Dialog>
