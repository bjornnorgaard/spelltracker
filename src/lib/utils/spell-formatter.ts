/**
 * Format spell level number for display
 * @example 0 -> "Cantrip", 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th"
 */
export function formatSpellLevel(level: number): string {
    if (level === 0) return 'Cantrip';

    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = level % 100;
    const suffix = suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];

    return `${level}${suffix}`;
}

/**
 * Format spell level for longer display
 * @example 0 -> "Cantrip", 1 -> "1st-level", 2 -> "2nd-level"
 */
export function formatSpellLevelLong(level: number): string {
    if (level === 0) return 'Cantrip';
    return `${formatSpellLevel(level)}-level`;
}

/**
 * Parse spell level string to number
 * @example "Cantrip" -> 0, "1st" -> 1, "2nd" -> 2
 */
export function parseSpellLevel(levelStr: string): number {
    const cleaned = levelStr.trim().toLowerCase();
    if (cleaned.includes('cantrip')) return 0;

    const match = cleaned.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get ordinal suffix for a number
 * @example 1 -> "st", 2 -> "nd", 3 -> "rd", 4 -> "th"
 */
export function getOrdinalSuffix(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
}
