import type { Spell } from '$lib/types/spell';

/**
 * CSV parsing result
 */
export interface CSVParseResult {
    spells: Spell[];
    errors: string[];
    warnings: string[];
}

/**
 * Parse CSV spell level string to number
 * @example "Cantrip" -> 0, "1st" -> 1, "2nd" -> 2, etc.
 */
function parseSpellLevel(levelStr: string): number {
    const cleaned = levelStr.trim().toLowerCase();
    if (cleaned.includes('cantrip')) return 0;
    const match = cleaned.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * Split CSV-style string into array, respecting quoted values
 */
function splitCSVValue(value: string, delimiter: string = ','): string[] {
    if (!value || value.trim() === '') return [];

    return value
        .split(delimiter)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

/**
 * Parse a single CSV row into a Spell object
 */
function parseSpellRow(row: string[], headers: string[], rowIndex: number): Spell | null {
    try {
        const getField = (name: string): string => {
            const index = headers.indexOf(name);
            return index >= 0 ? row[index]?.trim() || '' : '';
        };

        const name = getField('Name');
        if (!name) {
            return null; // Skip rows without names
        }

        const spell: Spell = {
            id: crypto.randomUUID(),
            name,
            source: getField('Source'),
            page: getField('Page'),
            level: parseSpellLevel(getField('Level')),
            castingTime: getField('Casting Time'),
            duration: getField('Duration'),
            school: getField('School'),
            range: getField('Range'),
            components: getField('Components'),
            classes: splitCSVValue(getField('Classes')),
            text: getField('Text'),
            atHigherLevels: getField('At Higher Levels')
        };

        return spell;
    } catch (error) {
        console.error(`Error parsing row ${rowIndex}:`, error);
        return null;
    }
}

/**
 * Parse CSV text content into array of rows
 */
function parseCSVText(csvText: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            // End of row
            if (char === '\r' && nextChar === '\n') {
                i++; // Skip \n in \r\n
            }
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField);
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            }
        } else {
            currentField += char;
        }
    }

    // Add final field and row if needed
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    return rows;
}

/**
 * Validate that required CSV headers are present
 */
function validateHeaders(headers: string[]): string[] {
    const requiredHeaders = [
        'Name',
        'Level',
        'School',
        'Casting Time',
        'Range',
        'Components',
        'Duration',
        'Classes'
    ];

    const missing: string[] = [];
    for (const required of requiredHeaders) {
        if (!headers.includes(required)) {
            missing.push(required);
        }
    }

    return missing;
}

/**
 * Parse CSV content containing D&D 5e spells
 */
export function parseSpellCSV(csvText: string): CSVParseResult {
    const result: CSVParseResult = {
        spells: [],
        errors: [],
        warnings: []
    };

    if (!csvText || csvText.trim() === '') {
        result.errors.push('CSV content is empty');
        return result;
    }

    try {
        const rows = parseCSVText(csvText);

        if (rows.length === 0) {
            result.errors.push('No rows found in CSV');
            return result;
        }

        // First row should be headers
        const headers = rows[0].map((h) => h.trim());
        const missingHeaders = validateHeaders(headers);

        if (missingHeaders.length > 0) {
            result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
            return result;
        }

        // Parse data rows
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            // Skip empty rows
            if (row.every((cell) => !cell || cell.trim() === '')) {
                continue;
            }

            const spell = parseSpellRow(row, headers, i + 1);

            if (spell) {
                result.spells.push(spell);
            } else {
                result.warnings.push(`Row ${i + 1}: Could not parse spell (missing name)`);
            }
        }

        if (result.spells.length === 0) {
            result.warnings.push('No valid spells found in CSV');
        }
    } catch (error) {
        result.errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
}

/**
 * Validate a single spell object
 */
export function validateSpell(spell: Spell): string[] {
    const errors: string[] = [];

    if (!spell.name || spell.name.trim() === '') {
        errors.push('Spell name is required');
    }

    if (spell.level < 0 || spell.level > 9) {
        errors.push('Spell level must be between 0 (Cantrip) and 9');
    }

    if (!spell.school || spell.school.trim() === '') {
        errors.push('Spell school is required');
    }

    if (spell.classes.length === 0) {
        errors.push('At least one class is required');
    }

    return errors;
}
