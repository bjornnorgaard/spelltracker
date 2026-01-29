<script lang="ts">
	import CharacterForm from '$lib/components/character/CharacterForm.svelte';
	import { characterStore } from '$lib/stores/characters.svelte';
	import { goto } from '$app/navigation';
	import type { Character } from '$lib/types/character';

	function handleSubmit(data: Omit<Character, 'id'>) {
		const newCharacter = characterStore.addCharacter(data);
		goto(`/characters/${newCharacter.id}`);
	}

	function handleCancel() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Create Character - D&D Spelltracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<div class="mb-8">
		<a href="/" class="anchor text-sm mb-4 inline-block">← Back to Characters</a>
		<h1 class="h1 mb-2">Create New Character</h1>
		<p class="opacity-75">Fill in the details to create your character</p>
	</div>

	<div class="card p-6">
		<CharacterForm onSubmit={handleSubmit} onCancel={handleCancel} />
	</div>
</div>
