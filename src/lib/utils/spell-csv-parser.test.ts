import { describe, it, expect } from 'vitest';
import { parseSpellCSV, getDemoSpellCSV } from './spell-csv-parser';

describe('spell-csv-parser', () => {
    describe('parseSpellCSV', () => {
        it('should parse a single spell correctly', () => {
            const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Fire Bolt","PHB'24","274","Cantrip","Action","Instantaneous","Evocation","120 feet","V, S","Artificer (EFA), Sorcerer (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue","You hurl a mote of fire at a creature or an object within range.","Cantrip Upgrade. The damage increases by 1d10."`;

            const spells = parseSpellCSV(csv);

            expect(spells).toHaveLength(1);
            expect(spells[0].name).toBe('Fire Bolt');
            expect(spells[0].source).toBe("PHB'24");
            expect(spells[0].level).toBe(0); // Cantrip
            expect(spells[0].school).toBe('Evocation');
            expect(spells[0].castingTime).toBe('Action');
            expect(spells[0].duration).toBe('Instantaneous');
            expect(spells[0].range).toBe('120 feet');
            expect(spells[0].components).toBe('V, S');
            expect(spells[0].classes).toContain('Artificer (EFA)');
            expect(spells[0].classes).toContain('Sorcerer (PHB\'24)');
            expect(spells[0].text).toContain('You hurl a mote of fire');
            expect(spells[0].atHigherLevels).toContain('Cantrip Upgrade');
        });

        it('should parse multiple spells', () => {
            const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Fire Bolt","PHB'24","274","Cantrip","Action","Instantaneous","Evocation","120 feet","V, S","Sorcerer (PHB'24)","","","Test","Test"
"Fireball","PHB'24","274","3rd","Action","Instantaneous","Evocation","150 feet","V, S, M","Sorcerer (PHB'24)","","","Test","Test"`;

            const spells = parseSpellCSV(csv);

            expect(spells).toHaveLength(2);
            expect(spells[0].name).toBe('Fire Bolt');
            expect(spells[0].level).toBe(0);
            expect(spells[1].name).toBe('Fireball');
            expect(spells[1].level).toBe(3);
        });

        it('should handle different level formats', () => {
            const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Cantrip Spell","PHB","1","Cantrip","Action","Instant","Evocation","Self","V","Wizard","","","Test",""
"First Level","PHB","2","1st","Action","Instant","Evocation","Self","V","Wizard","","","Test",""
"Second Level","PHB","3","2nd","Action","Instant","Evocation","Self","V","Wizard","","","Test",""
"Third Level","PHB","4","3rd","Action","Instant","Evocation","Self","V","Wizard","","","Test",""`;

            const spells = parseSpellCSV(csv);

            expect(spells[0].level).toBe(0);
            expect(spells[1].level).toBe(1);
            expect(spells[2].level).toBe(2);
            expect(spells[3].level).toBe(3);
        });

        it('should handle quoted fields with commas', () => {
            const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Test Spell","PHB","1","1st","Action","1 hour","Evocation","60 feet","V, S, M (a ball of bat guano and sulfur)","Sorcerer (PHB'24), Wizard (PHB'24)","","","You cast a spell, and it does damage.","Using a Higher-Level Spell Slot. The damage increases."`;

            const spells = parseSpellCSV(csv);

            expect(spells).toHaveLength(1);
            expect(spells[0].components).toBe('V, S, M (a ball of bat guano and sulfur)');
            expect(spells[0].classes).toHaveLength(2);
            expect(spells[0].text).toContain('You cast a spell, and it does damage.');
        });

        it('should skip empty lines', () => {
            const csv = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Fire Bolt","PHB","1","Cantrip","Action","Instant","Evocation","Self","V","Wizard","","","Test",""

"Fireball","PHB","2","3rd","Action","Instant","Evocation","Self","V","Wizard","","","Test",""`;

            const spells = parseSpellCSV(csv);

            expect(spells).toHaveLength(2);
        });

        it('should generate unique IDs for each spell', () => {
            const csv = getDemoSpellCSV();
            const spells = parseSpellCSV(csv);

            const ids = spells.map((s) => s.id);
            const uniqueIds = new Set(ids);

            expect(ids.length).toBe(uniqueIds.size);
        });

        it('should throw error for invalid CSV without header', () => {
            const csv = 'just some text';

            expect(() => parseSpellCSV(csv)).toThrow();
        });

        it('should parse demo CSV successfully', () => {
            const csv = getDemoSpellCSV();
            const spells = parseSpellCSV(csv);

            expect(spells.length).toBeGreaterThan(0);
            spells.forEach((spell) => {
                expect(spell.id).toBeDefined();
                expect(spell.name).toBeDefined();
                expect(spell.level).toBeGreaterThanOrEqual(0);
                expect(spell.school).toBeDefined();
            });
        });
    });

    describe('getDemoSpellCSV', () => {
        it('should return valid CSV string', () => {
            const csv = getDemoSpellCSV();

            expect(csv).toBeTruthy();
            expect(csv).toContain('Name');
            expect(csv).toContain('Fire Bolt');
            expect(csv).toContain('Fireball');
        });
    });
});
