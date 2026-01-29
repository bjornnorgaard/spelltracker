import { describe, it, expect } from 'vitest';
import { parseSpellCSV, validateSpell } from './csv-parser';

describe('parseSpellCSV', () => {
    it('should parse valid CSV with spell data', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Fire Bolt","PHB'24","274","Cantrip","Action","Instantaneous","Evocation","120 feet","V, S","Sorcerer (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue","You hurl a mote of fire at a creature.","Damage increases by 1d10."`;

        const result = parseSpellCSV(csv);

        expect(result.errors).toHaveLength(0);
        expect(result.spells).toHaveLength(1);
        expect(result.spells[0].name).toBe('Fire Bolt');
        expect(result.spells[0].level).toBe(0);
        expect(result.spells[0].school).toBe('Evocation');
        expect(result.spells[0].classes).toContain('Sorcerer (PHB\'24)');
        expect(result.spells[0].classes).toContain('Wizard (PHB\'24)');
    });

    it('should handle multiple spells', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Fire Bolt","PHB'24","274","Cantrip","Action","Instantaneous","Evocation","120 feet","V, S","Sorcerer","","","Test","Test"
"Fireball","PHB'24","274","3rd","Action","Instantaneous","Evocation","150 feet","V, S, M","Sorcerer, Wizard","","","Test","Test"`;

        const result = parseSpellCSV(csv);

        expect(result.errors).toHaveLength(0);
        expect(result.spells).toHaveLength(2);
        expect(result.spells[0].name).toBe('Fire Bolt');
        expect(result.spells[0].level).toBe(0);
        expect(result.spells[1].name).toBe('Fireball');
        expect(result.spells[1].level).toBe(3);
    });

    it('should parse spell levels correctly', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Cantrip Spell","PHB","1","Cantrip","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""
"First Level","PHB","2","1st","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""
"Second Level","PHB","3","2nd","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""
"Third Level","PHB","4","3rd","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""
"Ninth Level","PHB","5","9th","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""`;

        const result = parseSpellCSV(csv);

        expect(result.spells).toHaveLength(5);
        expect(result.spells[0].level).toBe(0);
        expect(result.spells[1].level).toBe(1);
        expect(result.spells[2].level).toBe(2);
        expect(result.spells[3].level).toBe(3);
        expect(result.spells[4].level).toBe(9);
    });

    it('should handle quoted fields with commas', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Test Spell","PHB","1","1st","Action","Instant","Evocation","30 ft","V, S, M (a gem worth 100gp)","Wizard, Sorcerer, Bard","","","A spell with commas, quotes, and ""escaped quotes"".",""`;

        const result = parseSpellCSV(csv);

        expect(result.errors).toHaveLength(0);
        expect(result.spells).toHaveLength(1);
        expect(result.spells[0].components).toBe('V, S, M (a gem worth 100gp)');
        expect(result.spells[0].classes).toHaveLength(3);
        expect(result.spells[0].text).toContain('commas, quotes');
    });

    it('should handle empty CSV', () => {
        const result = parseSpellCSV('');

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('empty');
        expect(result.spells).toHaveLength(0);
    });

    it('should detect missing required headers', () => {
        const csv = `"Name","Level","School"
"Test","1st","Evocation"`;

        const result = parseSpellCSV(csv);

        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('Missing required headers');
    });

    it('should skip rows without names', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Fire Bolt","PHB","1","Cantrip","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""
"","PHB","2","1st","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""
"Shield","PHB","3","1st","Reaction","1 round","Abjuration","Self","V, S","Wizard","","","Test",""`;

        const result = parseSpellCSV(csv);

        expect(result.spells).toHaveLength(2);
        expect(result.spells[0].name).toBe('Fire Bolt');
        expect(result.spells[1].name).toBe('Shield');
        expect(result.warnings).toHaveLength(1);
    });

    it('should skip empty rows', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Fire Bolt","PHB","1","Cantrip","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""

"Shield","PHB","3","1st","Reaction","1 round","Abjuration","Self","V, S","Wizard","","","Test",""`;

        const result = parseSpellCSV(csv);

        expect(result.spells).toHaveLength(2);
    });

    it('should handle Windows line endings (CRLF)', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"\r\n"Fire Bolt","PHB","1","Cantrip","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""\r\n"Shield","PHB","3","1st","Reaction","1 round","Abjuration","Self","V, S","Wizard","","","Test",""`;

        const result = parseSpellCSV(csv);

        expect(result.spells).toHaveLength(2);
    });

    it('should parse class lists correctly', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Test","PHB","1","1st","Action","Instant","Evocation","30 ft","V","Wizard, Sorcerer, Bard, Cleric","Artificer","Arcane Trickster Rogue, Eldritch Knight Fighter","Test",""`;

        const result = parseSpellCSV(csv);

        expect(result.spells[0].classes).toHaveLength(4);
        expect(result.spells[0].classes).toContain('Wizard');
        expect(result.spells[0].classes).toContain('Sorcerer');
        expect(result.spells[0].optionalClasses).toContain('Artificer');
        expect(result.spells[0].subclasses).toHaveLength(2);
    });

    it('should generate unique IDs for each spell', () => {
        const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Spell 1","PHB","1","1st","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""
"Spell 2","PHB","2","1st","Action","Instant","Evocation","30 ft","V","Wizard","","","Test",""`;

        const result = parseSpellCSV(csv);

        expect(result.spells[0].id).toBeDefined();
        expect(result.spells[1].id).toBeDefined();
        expect(result.spells[0].id).not.toBe(result.spells[1].id);
    });
});

describe('validateSpell', () => {
    it('should validate a correct spell', () => {
        const spell = {
            id: '123',
            name: 'Fireball',
            source: 'PHB',
            page: '241',
            level: 3,
            castingTime: 'Action',
            duration: 'Instantaneous',
            school: 'Evocation',
            range: '150 feet',
            components: 'V, S, M',
            classes: ['Sorcerer', 'Wizard'],
            optionalClasses: [],
            subclasses: [],
            text: 'A bright streak...',
            atHigherLevels: 'Damage increases...'
        };

        const errors = validateSpell(spell);
        expect(errors).toHaveLength(0);
    });

    it('should require spell name', () => {
        const spell = {
            id: '123',
            name: '',
            source: 'PHB',
            page: '241',
            level: 3,
            castingTime: 'Action',
            duration: 'Instantaneous',
            school: 'Evocation',
            range: '150 feet',
            components: 'V, S, M',
            classes: ['Sorcerer'],
            optionalClasses: [],
            subclasses: [],
            text: 'Test',
            atHigherLevels: ''
        };

        const errors = validateSpell(spell);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('should validate spell level range (0-9)', () => {
        const spellNegative = {
            id: '123',
            name: 'Test',
            source: 'PHB',
            page: '1',
            level: -1,
            castingTime: 'Action',
            duration: 'Instant',
            school: 'Evocation',
            range: '30 ft',
            components: 'V',
            classes: ['Wizard'],
            optionalClasses: [],
            subclasses: [],
            text: 'Test',
            atHigherLevels: ''
        };

        const spellTooHigh = { ...spellNegative, level: 10 };

        expect(validateSpell(spellNegative).some((e) => e.includes('level'))).toBe(true);
        expect(validateSpell(spellTooHigh).some((e) => e.includes('level'))).toBe(true);
    });

    it('should require spell school', () => {
        const spell = {
            id: '123',
            name: 'Test',
            source: 'PHB',
            page: '1',
            level: 1,
            castingTime: 'Action',
            duration: 'Instant',
            school: '',
            range: '30 ft',
            components: 'V',
            classes: ['Wizard'],
            optionalClasses: [],
            subclasses: [],
            text: 'Test',
            atHigherLevels: ''
        };

        const errors = validateSpell(spell);
        expect(errors.some((e) => e.includes('school'))).toBe(true);
    });

    it('should require at least one class', () => {
        const spell = {
            id: '123',
            name: 'Test',
            source: 'PHB',
            page: '1',
            level: 1,
            castingTime: 'Action',
            duration: 'Instant',
            school: 'Evocation',
            range: '30 ft',
            components: 'V',
            classes: [],
            optionalClasses: [],
            subclasses: [],
            text: 'Test',
            atHigherLevels: ''
        };

        const errors = validateSpell(spell);
        expect(errors.some((e) => e.includes('class'))).toBe(true);
    });
});
