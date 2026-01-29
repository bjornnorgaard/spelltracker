<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { page } from "$app/state";

	let { children } = $props();

	const navItems = [
		{ href: "/", label: "Characters", icon: "👤" },
		{ href: "/spells", label: "Spells", icon: "✨" },
		{ href: "/demo", label: "Demo", icon: "🎨" },
	];

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Navigation -->
	<nav class="">
		<div class="mx-auto px-4">
			<div class="flex items-center justify-between h-16">
				<!-- Logo/Brand -->
				<a href="/" class="flex items-center gap-2 font-bold text-xl">
					<span>🎲</span>
					<span class="hidden sm:inline">D&D Spelltracker</span>
					<span class="sm:hidden">Spelltracker</span>
				</a>

				<!-- Desktop Navigation -->
				<div class="hidden md:flex items-center gap-2">
					{#each navItems as item}
						<a href={item.href} class="btn text-sm" class:preset-filled-primary-500={page.url.pathname === item.href} class:preset-tonal={page.url.pathname !== item.href}>
							<span class="mr-1">{item.icon}</span>
							{item.label}
						</a>
					{/each}
				</div>

				<!-- Mobile Menu Button -->
				<button onclick={toggleMobileMenu} class="btn preset-tonal md:hidden" aria-label="Toggle menu">
					{#if mobileMenuOpen}
						<span class="text-xl">✕</span>
					{:else}
						<span class="text-xl">☰</span>
					{/if}
				</button>
			</div>

			<!-- Mobile Navigation -->
			{#if mobileMenuOpen}
				<div class="md:hidden py-4 space-y-2">
					{#each navItems as item}
						<a
							href={item.href}
							onclick={closeMobileMenu}
							class="btn w-full text-left"
							class:preset-filled-primary-500={page.url.pathname === item.href}
							class:preset-tonal={page.url.pathname !== item.href}>
							<span class="mr-2">{item.icon}</span>
							{item.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</nav>

	<!-- Main Content -->
	<main class="flex-1 px-4 mx-auto max-w-3xl">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="py-4 mt-auto">
		<div class="container mx-auto px-4 text-center text-sm opacity-75">
			<p>D&D Spelltracker - Manage your spells and characters</p>
		</div>
	</footer>
</div>
