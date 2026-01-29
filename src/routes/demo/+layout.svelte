<script lang="ts">
    import { page } from "$app/state";

    const navItems = [
        { href: "/demo", label: "Overview" },
        { href: "/demo/selector", label: "Character Selector" },
        { href: "/demo/card", label: "Character Card" },
        { href: "/demo/form", label: "Character Form" },
    ];

    let children = $props();
</script>

<div class="min-h-screen">
    <nav class="bg-surface-100-800-token border-b border-surface-300-600-token">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-8">
                    <a href="/demo" class="font-bold text-lg">Component Demo</a>
                    <div class="flex gap-2">
                        {#each navItems as item}
                            <a
                                href={item.href}
                                class="px-4 py-2 rounded-lg transition-colors"
                                class:preset-filled-primary-500={page.url.pathname === item.href}
                                class:preset-tonal={page.url.pathname !== item.href}>
                                {item.label}
                            </a>
                        {/each}
                    </div>
                </div>
                <a href="/characters" class="btn preset-tonal-surface text-sm"> ← Back to App </a>
            </div>
        </div>
    </nav>

    <main class="container mx-auto px-4 py-8 max-w-7xl">
        {@render children.children()}
    </main>
</div>
