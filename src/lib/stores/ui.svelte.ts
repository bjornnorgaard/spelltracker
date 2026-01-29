import type { SpellFilters } from '$lib/types/app-state';

/**
 * Reactive store for UI state (filters, search, modals, etc.)
 */
class UIStore {
	#filters = $state<SpellFilters>({
		level: []
	});

	#searchQuery = $state<string>('');
	#isLoading = $state<boolean>(false);

	get filters(): SpellFilters {
		return this.#filters;
	}

	set filters(value: SpellFilters) {
		this.#filters = value;
	}

	get searchQuery(): string {
		return this.#searchQuery;
	}

	set searchQuery(value: string) {
		this.#searchQuery = value;
	}

	get isLoading(): boolean {
		return this.#isLoading;
	}

	set isLoading(value: boolean) {
		this.#isLoading = value;
	}

	/**
	 * Update filter for a specific category
	 */
	updateFilter(category: keyof SpellFilters, values: number[]): void {
		this.#filters = {
			...this.#filters,
			[category]: values
		};
	}

	/**
	 * Clear all filters
	 */
	clearFilters(): void {
		this.#filters = {
			level: []
		};
	}

	/**
	 * Clear search query
	 */
	clearSearch(): void {
		this.#searchQuery = '';
	}

	/**
	 * Reset all UI state
	 */
	reset(): void {
		this.clearFilters();
		this.clearSearch();
		this.#isLoading = false;
	}
}

export const uiStore = new UIStore();
