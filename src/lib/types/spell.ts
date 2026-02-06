/**
 * D&D 5e Spell data structure
 */
export interface Spell {
    id: string;
    name: string;
    source: string;
    page: string;
    level: number; // 0 = Cantrip, 1-9 = spell levels
    castingTime: string;
    duration: string;
    school: string;
    range: string;
    components: string;
    classes: string[];
    text: string;
    atHigherLevels: string;
}

