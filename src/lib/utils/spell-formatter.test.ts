import { describe, it, expect } from 'vitest';
import {
    formatSpellLevel,
    formatSpellLevelLong,
    parseSpellLevel,
    getOrdinalSuffix
} from './spell-formatter';

describe('formatSpellLevel', () => {
    it('should format cantrip (level 0)', () => {
        expect(formatSpellLevel(0)).toBe('Cantrip');
    });

    it('should format 1st level spell', () => {
        expect(formatSpellLevel(1)).toBe('1st');
    });

    it('should format 2nd level spell', () => {
        expect(formatSpellLevel(2)).toBe('2nd');
    });

    it('should format 3rd level spell', () => {
        expect(formatSpellLevel(3)).toBe('3rd');
    });

    it('should format 4th-9th level spells with "th"', () => {
        expect(formatSpellLevel(4)).toBe('4th');
        expect(formatSpellLevel(5)).toBe('5th');
        expect(formatSpellLevel(6)).toBe('6th');
        expect(formatSpellLevel(7)).toBe('7th');
        expect(formatSpellLevel(8)).toBe('8th');
        expect(formatSpellLevel(9)).toBe('9th');
    });

    it('should handle numbers ending in 1, 2, 3 correctly for higher numbers', () => {
        expect(formatSpellLevel(11)).toBe('11th');
        expect(formatSpellLevel(12)).toBe('12th');
        expect(formatSpellLevel(13)).toBe('13th');
        expect(formatSpellLevel(21)).toBe('21st');
        expect(formatSpellLevel(22)).toBe('22nd');
        expect(formatSpellLevel(23)).toBe('23rd');
    });
});

describe('formatSpellLevelLong', () => {
    it('should format cantrip without "-level" suffix', () => {
        expect(formatSpellLevelLong(0)).toBe('Cantrip');
    });

    it('should format spell levels with "-level" suffix', () => {
        expect(formatSpellLevelLong(1)).toBe('1st-level');
        expect(formatSpellLevelLong(2)).toBe('2nd-level');
        expect(formatSpellLevelLong(3)).toBe('3rd-level');
        expect(formatSpellLevelLong(9)).toBe('9th-level');
    });
});

describe('parseSpellLevel', () => {
    it('should parse "Cantrip" to 0', () => {
        expect(parseSpellLevel('Cantrip')).toBe(0);
        expect(parseSpellLevel('cantrip')).toBe(0);
        expect(parseSpellLevel('CANTRIP')).toBe(0);
    });

    it('should parse ordinal numbers', () => {
        expect(parseSpellLevel('1st')).toBe(1);
        expect(parseSpellLevel('2nd')).toBe(2);
        expect(parseSpellLevel('3rd')).toBe(3);
        expect(parseSpellLevel('4th')).toBe(4);
        expect(parseSpellLevel('9th')).toBe(9);
    });

    it('should parse plain numbers', () => {
        expect(parseSpellLevel('1')).toBe(1);
        expect(parseSpellLevel('5')).toBe(5);
        expect(parseSpellLevel('9')).toBe(9);
    });

    it('should handle whitespace', () => {
        expect(parseSpellLevel('  1st  ')).toBe(1);
        expect(parseSpellLevel(' Cantrip ')).toBe(0);
    });

    it('should return 0 for invalid input', () => {
        expect(parseSpellLevel('')).toBe(0);
        expect(parseSpellLevel('invalid')).toBe(0);
        expect(parseSpellLevel('abc')).toBe(0);
    });
});

describe('getOrdinalSuffix', () => {
    it('should return "st" for numbers ending in 1 (except 11)', () => {
        expect(getOrdinalSuffix(1)).toBe('st');
        expect(getOrdinalSuffix(21)).toBe('st');
        expect(getOrdinalSuffix(31)).toBe('st');
    });

    it('should return "nd" for numbers ending in 2 (except 12)', () => {
        expect(getOrdinalSuffix(2)).toBe('nd');
        expect(getOrdinalSuffix(22)).toBe('nd');
        expect(getOrdinalSuffix(32)).toBe('nd');
    });

    it('should return "rd" for numbers ending in 3 (except 13)', () => {
        expect(getOrdinalSuffix(3)).toBe('rd');
        expect(getOrdinalSuffix(23)).toBe('rd');
        expect(getOrdinalSuffix(33)).toBe('rd');
    });

    it('should return "th" for 11, 12, 13', () => {
        expect(getOrdinalSuffix(11)).toBe('th');
        expect(getOrdinalSuffix(12)).toBe('th');
        expect(getOrdinalSuffix(13)).toBe('th');
    });

    it('should return "th" for all other numbers', () => {
        expect(getOrdinalSuffix(4)).toBe('th');
        expect(getOrdinalSuffix(5)).toBe('th');
        expect(getOrdinalSuffix(20)).toBe('th');
        expect(getOrdinalSuffix(100)).toBe('th');
    });
});
