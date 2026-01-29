import type { Spell } from '$lib/types/spell';

/**
 * Parse CSV spell data into Spell objects
 * Expects CSV format from D&D sources with headers:
 * Name, Source, Page, Level, Casting Time, Duration, School, Range, Components, Classes, Optional/Variant Classes, Subclasses, Text, At Higher Levels
 */
export function parseSpellCSV(csvData: string): Spell[] {
    const lines = csvData.trim().split('\n');

    if (lines.length < 2) {
        throw new Error('Invalid CSV: Must have at least a header and one data row');
    }

    // Parse header line
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);

    // Validate headers
    const requiredHeaders = [
        'Name',
        'Source',
        'Page',
        'Level',
        'Casting Time',
        'Duration',
        'School',
        'Range',
        'Components',
        'Classes',
        'Optional/Variant Classes',
        'Subclasses',
        'Text',
        'At Higher Levels'
    ];

    const hasAllHeaders = requiredHeaders.every((header) =>
        headers.some((h) => h.toLowerCase() === header.toLowerCase())
    );

    if (!hasAllHeaders) {
        throw new Error(
            `Invalid CSV: Missing required headers. Expected: ${requiredHeaders.join(', ')}`
        );
    }

    // Parse data lines
    const spells: Spell[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        try {
            const values = parseCSVLine(line);

            if (values.length < headers.length) {
                console.warn(`Skipping line ${i + 1}: Insufficient values`);
                continue;
            }

            const spell = parseSpellFromValues(headers, values);
            spells.push(spell);
        } catch (error) {
            console.warn(`Error parsing line ${i + 1}:`, error);
        }
    }

    return spells;
}

/**
 * Parse a CSV line, handling quoted fields properly
 */
function parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // Check if this is an escaped quote
            if (insideQuotes && line[i + 1] === '"') {
                currentValue += '"';
                i++; // Skip next quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    // Add the last value
    values.push(currentValue.trim());

    return values;
}

/**
 * Parse spell from CSV values
 */
function parseSpellFromValues(headers: string[], values: string[]): Spell {
    const getValueByHeader = (header: string): string => {
        const index = headers.findIndex((h) => h.toLowerCase() === header.toLowerCase());
        return index >= 0 ? values[index] : '';
    };

    const name = getValueByHeader('Name');
    const levelStr = getValueByHeader('Level');

    // Parse level (handle "Cantrip", "1st", "2nd", etc.)
    let level = 0;
    if (levelStr.toLowerCase().includes('cantrip')) {
        level = 0;
    } else {
        const match = levelStr.match(/(\d+)/);
        level = match ? parseInt(match[1], 10) : 0;
    }

    // Parse classes
    const classesStr = getValueByHeader('Classes');
    const classes = classesStr
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

    // Parse optional classes
    const optionalClassesStr = getValueByHeader('Optional/Variant Classes');
    const optionalClasses = optionalClassesStr
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

    // Parse subclasses
    const subclassesStr = getValueByHeader('Subclasses');
    const subclasses = subclassesStr
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

    return {
        id: crypto.randomUUID(),
        name,
        source: getValueByHeader('Source'),
        page: getValueByHeader('Page'),
        level,
        castingTime: getValueByHeader('Casting Time'),
        duration: getValueByHeader('Duration'),
        school: getValueByHeader('School'),
        range: getValueByHeader('Range'),
        components: getValueByHeader('Components'),
        classes,
        optionalClasses,
        subclasses,
        text: getValueByHeader('Text'),
        atHigherLevels: getValueByHeader('At Higher Levels')
    };
}

/**
 * Get demo spell CSV data for testing
 */
export function getDemoSpellCSV(): string {
    return `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Cloud of Daggers","PHB'24","251","2nd","Action","Concentration, up to 1 minute","Conjuration","60 feet","V, S, M (a sliver of glass)","Bard (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You conjure spinning daggers in a 5-foot Cube centered on a point within range. Each creature in that area takes 4d4 Slashing damage. A creature also takes this damage if it enters the Cube or ends its turn there or if the Cube moves into its space. A creature takes this damage only once per turn.On your later turns, you can take a Magic action to teleport the Cube up to 30 feet.","Using a Higher-Level Spell Slot. The damage increases by 2d4 for each spell slot level above 2."
"Comprehend Languages","PHB'24","252","1st","Action","1 hour","Divination (ritual)","Self","V, S, M (a pinch of soot and salt)","Apothecary (SCGtD), Bard (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Apocalypse (GH:PG'24) Sorcerer, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Banneret (FRHoF) Fighter, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","For the duration, you understand the literal meaning of any language that you hear or see signed. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text. This spell doesn't decode symbols or secret messages.",""
"Detect Magic","PHB'24","262","1st","Action","Concentration, up to 10 minutes","Divination (ritual)","Self","V, S","Apothecary (SCGtD), Artificer (EFA), Bard (PHB'24), Cleric (PHB'24), Druid (PHB'24), Paladin (PHB'24), Ranger (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric, Spelldrinker (TGS2) Paladin, Spelldrinker (TGS2) Paladin, Watchers (TCE) Paladin, Watchers (TCE) Paladin, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","For the duration, you sense the presence of magical effects within 30 feet of yourself. If you sense such effects, you can take the Magic action to see a faint aura around any visible creature or object in the area that bears the magic, and if an effect was created by a spell, you learn the spell's school of magic.The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead.",""
"Feather Fall","PHB'24","271","1st","Action","1 minute","Transmutation","60 feet","V, M (a small feather or piece of down)","Apothecary (SCGtD), Artificer (EFA), Bard (PHB'24), Sorcerer (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Occultist (GH:PG'24) Monster Hunter, Rocborne (TGS2) Ranger, Rocborne (TGS2) Ranger, Sanguine Thief (GH:PG'24) Rogue, Urban (SCGtD) Ranger, Urban (SCGtD) Ranger, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If a creature lands before the spell ends, the creature takes no damage from the fall, and the spell ends for that creature.",""
"Fire Bolt","PHB'24","274","Cantrip","Action","Instantaneous","Evocation","120 feet","V, S","Artificer (EFA), Sorcerer (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Chemist (SCGtD) Apothecary, Land (Arid Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn't being worn or carried.","Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
"Fireball","PHB'24","274","3rd","Action","Instantaneous","Evocation","150 feet","V, S, M (a ball of bat guano and sulfur)","Sorcerer (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Chemist (SCGtD) Apothecary, Land (Arid Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Fiend (PHB'24) Warlock, Light (PHB'24) Cleric, Light (PHB'14) Cleric, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Fiend (PHB'14) Warlock, Genie (Efreeti) (TCE) Warlock, Genie (Efreeti) (TCE) Warlock, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric","A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.Flammable objects in the area that aren't being worn or carried start burning.","Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."
"Fireball","PHB'24","274","3rd","Action","Instantaneous","Evocation","150 feet","V, S, M (a ball of bat guano and sulfur)","Sorcerer (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Chemist (SCGtD) Apothecary, Land (Arid Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Fiend (PHB'24) Warlock, Light (PHB'24) Cleric, Light (PHB'14) Cleric, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Fiend (PHB'14) Warlock, Genie (Efreeti) (TCE) Warlock, Genie (Efreeti) (TCE) Warlock, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric","A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.Flammable objects in the area that aren't being worn or carried start burning.","Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."`;
}
