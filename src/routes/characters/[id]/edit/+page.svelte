<script lang="ts">
    import {DND_CLASSES} from "$lib/utils/constants";
    import {app} from "$lib/stores/app.svelte.js";
    import {goto} from "$app/navigation";
    import {formatSpellLevelLong} from "$lib/utils/spell-formatter";
    import {parseSpellCSV} from "$lib/utils/csv-parser";
    import type {Character} from "$lib/types/character";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import {ArrowLeft} from "@lucide/svelte";
    import CharacterCard from "$lib/components/CharacterCard.svelte";

    const {data} = $props();
    let character: Character = $derived.by(() => app.current.characters.find((c: any) => c.id === data.characterId));

    let importData = $state("");

    function goBack() {
        history.back();
    }

    async function deleteCharacter() {
        app.current.characters = app.current.characters?.filter((c: any) => c.id !== character.id);
        await goto("/");
    }

    async function readClipboard() {
        const text = await navigator.clipboard.readText();
        const result = parseSpellCSV(text);
        if (result.errors.length > 0) {
            importData = result.errors.join("\n");
        }
        importData = text;
    }

    function runImport() {
        // Parse CSV
        const result = parseSpellCSV(importData);

        // Fetch existing spells
        const characterSpellIds = [];

        for (let spell of result.spells) {
            // If an existing spell is found, update it.
            const existingSpell = app.current.spells.find((s: any) => s.name === spell.name);
            if (existingSpell) {
                existingSpell.page = spell.page;
                existingSpell.level = spell.level;
                existingSpell.school = spell.school;
                existingSpell.castingTime = spell.castingTime;
                existingSpell.duration = spell.duration;
                existingSpell.range = spell.range;
                existingSpell.components = spell.components;
                existingSpell.classes = spell.classes;
                characterSpellIds.push(existingSpell.id);
            } else {
                app.current.spells.push(spell);
                characterSpellIds.push(spell.id);
            }
        }

        app.current.characters.find((c: Character) => c.id === character.id).spellIds = characterSpellIds;
    }

    const spellImportPlaceholder = `"Name","Source","Page","Level","Casting Time","Duration","School","Range","Components","Classes","Optional/Variant Classes","Subclasses","Text","At Higher Levels"
"Comprehend Languages","PHB'24","252","1st","Action","1 hour","Divination (ritual)","Self","V, S, M (a pinch of soot and salt)","Apothecary (SCGtD), Bard (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Apocalypse (GH:PG'24) Sorcerer, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Banneret (FRHoF) Fighter, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","For the duration, you understand the literal meaning of any language that you hear or see signed. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text. This spell doesn't decode symbols or secret messages.",""
"Detect Magic","PHB'24","262","1st","Action","Concentration, up to 10 minutes","Divination (ritual)","Self","V, S","Apothecary (SCGtD), Artificer (EFA), Bard (PHB'24), Cleric (PHB'24), Druid (PHB'24), Paladin (PHB'24), Ranger (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric, Spelldrinker (TGS2) Paladin, Spelldrinker (TGS2) Paladin, Watchers (TCE) Paladin, Watchers (TCE) Paladin, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","For the duration, you sense the presence of magical effects within 30 feet of yourself. If you sense such effects, you can take the Magic action to see a faint aura around any visible creature or object in the area that bears the magic, and if an effect was created by a spell, you learn the spell's school of magic.The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead.",""
"Detect Thoughts","PHB'24","262","2nd","Action","Concentration, up to 1 minute","Divination","Self","V, S, M (1 Copper Piece)","Bard (PHB'24), Sorcerer (PHB'24), Wizard (PHB'24)","","Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Alienist (SCGtD) Apothecary, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch (GH:PG'24) Cleric, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Great Old One (PHB'24) Warlock, Knowledge (FRHoF) Cleric, Zeal (GH:PG'24) Paladin, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Great Old One (PHB'14) Warlock, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You activate one of the effects below. Until the spell ends, you can activate either effect as a Magic action on your later turns. Sense Thoughts. You sense the presence of thoughts within 30 feet of yourself that belong to creatures that know languages or are telepathic. You don't read the thoughts, but you know that a thinking creature is present.The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead. Read Thoughts. Target one creature you can see within 30 feet of yourself or one creature within 30 feet of yourself that you detected with the Sense Thoughts option. You learn what is most on the target's mind right now. If the target doesn't know any languages and isn't telepathic, you learn nothing.As a Magic action on your next turn, you can try to probe deeper into the target's mind. If you probe deeper, the target makes a Wisdom saving throw. On a failed save, you discern the target's reasoning, emotions, and something that looms large in its mind (such as a worry, love, or hate). On a successful save, the spell ends. Either way, the target knows that you are probing into its mind, and until you shift your attention away from the target's mind, the target can take an action on its turn to make an Intelligence (Arcana) check against your spell save DC, ending the spell on a success.",""
"Feather Fall","PHB'24","271","1st","Reaction","1 minute","Transmutation","60 feet","V, M (a small feather or piece of down)","Apothecary (SCGtD), Artificer (EFA), Bard (PHB'24), Sorcerer (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Occultist (GH:PG'24) Monster Hunter, Rocborne (TGS2) Ranger, Rocborne (TGS2) Ranger, Sanguine Thief (GH:PG'24) Rogue, Urban (SCGtD) Ranger, Urban (SCGtD) Ranger, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If a creature lands before the spell ends, the creature takes no damage from the fall, and the spell ends for that creature.",""
"Fire Bolt","PHB'24","274","Cantrip","Action","Instantaneous","Evocation","120 feet","V, S","Artificer (EFA), Sorcerer (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Chemist (SCGtD) Apothecary, Land (Arid Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn't being worn or carried.","Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
"Fireball","PHB'24","274","3rd","Action","Instantaneous","Evocation","150 feet","V, S, M (a ball of bat guano and sulfur)","Sorcerer (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Chemist (SCGtD) Apothecary, Land (Arid Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Fiend (PHB'24) Warlock, Light (PHB'24) Cleric, Light (PHB'14) Cleric, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Fiend (PHB'14) Warlock, Genie (Efreeti) (TCE) Warlock, Genie (Efreeti) (TCE) Warlock, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric","A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.Flammable objects in the area that aren't being worn or carried start burning.","Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."
"Friends","PHB'24","277","Cantrip","Action","Concentration, up to 1 minute","Enchantment","10 feet","S, M (some makeup)","Bard (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You magically emanate a sense of friendship toward one creature you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target succeeds automatically if it isn't a Humanoid, if you're fighting it, or if you have cast this spell on it within the past 24 hours.The spell ends early if the target takes damage or if you make an attack roll, deal damage, or force anyone to make a saving throw. When the spell ends, the target knows it was Charmed by you.",""
"Haste","PHB'24","284","3rd","Action","Concentration, up to 1 minute","Transmutation","30 feet","V, S, M (a shaving of licorice root)","Apothecary (SCGtD), Artificer (EFA), Sorcerer (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Grassland) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Flesh (SCGtD) Warlock, Flesh (SCGtD) Warlock, Horizon Walker (XGE) Ranger, Horizon Walker (XGE) Ranger, Mutagenist (SCGtD) Apothecary, Glory (PHB'24) Paladin, Glory (TCE) Paladin, Vengeance (PHB'24) Paladin, Vengeance (PHB'14) Paladin, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Urban (SCGtD) Ranger, Urban (SCGtD) Ranger, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric","Choose a willing creature that you can see within range. Until the spell ends, the target's Speed is doubled, it gains a +2 bonus to Armor Class, it has Advantage on Dexterity saving throws, and it gains an additional action on each of its turns. That action can be used to take only the Attack (one attack only), Dash, Disengage, Hide, or Utilize action.When the spell ends, the target is Incapacitated and has a Speed of 0 until the end of its next turn, as a wave of lethargy washes over it.",""
"Light","PHB'24","292","Cantrip","Action","1 hour","Evocation","Touch","V, M (a firefly or phosphorescent moss)","Apothecary (SCGtD), Artificer (EFA), Bard (PHB'24), Cleric (PHB'24), Sorcerer (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Celestial (PHB'24) Warlock, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Light (PHB'14) Cleric, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Celestial (XGE) Warlock, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You touch one Large or smaller object that isn't being worn or carried by someone else. Until the spell ends, the object sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The light can be colored as you like.Covering the object with something opaque blocks the light. The spell ends if you cast it again.",""
"Mage Armor","PHB'24","293","1st","Action","8 hours","Abjuration","Touch","V, S, M (a piece of cured leather)","Sorcerer (PHB'24), Wizard (PHB'24)","","Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You touch a willing creature who isn't wearing armor. Until the spell ends, the target's base AC becomes 13 plus its Dexterity modifier. The spell ends early if the target dons armor.",""
"Mage Hand","PHB'24","293","Cantrip","Action","1 minute","Conjuration","30 feet","V, S","Artificer (EFA), Bard (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Sinner (TCM'24) Rogue, Sinner (TCM'14) Rogue, Sinner (TCM'14) Rogue, Swarmkeeper (TCE) Ranger, Swarmkeeper (TCE) Ranger, Leaden Crown (GH:PG'24) Monk, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again.When you cast the spell, you can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial.As a Magic action on your later turns, you can control the hand thus again. As part of that action, you can move the hand up to 30 feet.The hand can't attack, activate magic items, or carry more than 10 pounds.",""
"Message","PHB'24","298","Cantrip","Action","1 round","Transmutation","120 feet","S, M (a copper wire)","Apothecary (SCGtD), Artificer (EFA), Bard (PHB'24), Druid (PHB'24), Sorcerer (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric","You point toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear.You can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier. Magical silence; 1 foot of stone, metal, or wood; or a thin sheet of lead blocks the spell.",""
"Minor Illusion","PHB'24","298","Cantrip","Action","1 minute","Illusion","30 feet","S, M (a bit of fleece)","Bard (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Illusion (PHB'14) Wizard, Scion of the Three (FRHoF) Rogue, Shadow (SCGtD) Cleric, Shadow (SCGtD) Cleric, Sinner (TCM'24) Rogue, Sinner (TCM'14) Rogue, Sinner (TCM'14) Rogue, Coven (GH:PG'24) Warlock, Shadow (PHB'24) Monk, Shadow (PHB'14) Monk, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You create a sound or an image of an object within range that lasts for the duration. See the descriptions below for the effects of each. The illusion ends if you cast this spell again.If a creature takes a Study action to examine the sound or image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the illusion becomes faint to the creature. Sound. If you create a sound, its volume can range from a whisper to a scream. It can be your voice, someone else's voice, a lion's roar, a beating of drums, or any other sound you choose. The sound continues unabated throughout the duration, or you can make discrete sounds at different times before the spell ends. Image. If you create an image of an object—such as a chair, muddy footprints, or a small chest—it must be no larger than a 5-foot Cube. The image can't create sound, light, smell, or any other sensory effect. Physical interaction with the image reveals it to be an illusion, since things can pass through it.",""
"Misty Step","PHB'24","299","2nd","Bonus","Instantaneous","Conjuration","Self","V","Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Archfey (PHB'24) Warlock, Land (Temperate Land) (PHB'24) Druid, Land (Coast) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Fey Wanderer (PHB'24) Ranger, Fey Wanderer (TCE) Ranger, Horizon Walker (XGE) Ranger, Horizon Walker (XGE) Ranger, Vengeance (PHB'24) Paladin, Vengeance (PHB'14) Paladin, Ancients (PHB'24) Paladin, Ancients (PHB'14) Paladin, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see.",""
"Prestidigitation","PHB'24","307","Cantrip","Action","1 hour","Transmutation","10 feet","V, S","Artificer (EFA), Bard (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Archer (XGE) Fighter, Arcane Archer (XGE) Fighter, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Occultist (GH:PG'24) Monster Hunter, Belly Brewer (O:TTG) Barbarian, Belly Brewer (O:TTG) Barbarian, Sanguine Thief (GH:PG'24) Rogue, Sinner (TCM'24) Rogue, Sinner (TCM'14) Rogue, Sinner (TCM'14) Rogue, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You create a magical effect within range. Choose the effect from the options below. If you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time. Sensory Effect. You create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musical notes, or an odd odor. Fire Play. You instantaneously light or snuff out a candle, a torch, or a small campfire. Clean or Soil. You instantaneously clean or soil an object no larger than 1 cubic foot. Minor Sensation. You chill, warm, or flavor up to 1 cubic foot of nonliving material for 1 hour. Magic Mark. You make a color, a small mark, or a symbol appear on an object or a surface for 1 hour. Minor Creation. You create a nonmagical trinket or an illusory image that can fit in your hand. It lasts until the end of your next turn. A trinket can deal no damage and has no monetary worth.",""
"Shield","PHB'24","316","1st","Reaction","1 round","Abjuration","Self","V, S","Sorcerer (PHB'24), Wizard (PHB'24)","","Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Flesh (SCGtD) Warlock, Flesh (SCGtD) Warlock, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","An imperceptible barrier of magical force protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from Magic Missile.",""
"Sorcerous Burst","PHB'24","318","Cantrip","Action","Instantaneous","Evocation","120 feet","V, S","Sorcerer (PHB'24)","","","You cast sorcerous energy at one creature or object within range. Make a ranged attack roll against the target. On a hit, the target takes 1d8 damage of a type you choose: Acid, Cold, Fire, Lightning, Poison, Psychic, or Thunder.If you roll an 8 on a d8 for this spell, you can roll another d8, and add it to the damage. When you cast this spell, the maximum number of these d8s you can add to the spell's damage equals your spellcasting ability modifier.","Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
"Suggestion","PHB'24","321","2nd","Action","Concentration, up to 8 hours","Enchantment","30 feet","V, M (a drop of honey)","Bard (PHB'24), Sorcerer (PHB'24), Warlock (PHB'24), Wizard (PHB'24)","","Alienist (SCGtD) Apothecary, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Fiend (PHB'24) Warlock, Horned King (TCM'24) Warlock, Knowledge (PHB'14) Cleric, Hexes (SCGtD) Paladin, Hexes (SCGtD) Paladin, Occultist (GH:PG'24) Monster Hunter, Sanguine Thief (GH:PG'24) Rogue, Horned King (TCM'14) Warlock, Horned King (TCM'14) Warlock, Arcane Hand (SCGtD) Monk, Arcane Hand (SCGtD) Monk","You suggest a course of activity—described in no more than 25 words—to one creature you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to the target or its allies. For example, you could say, ""Fetch the key to the cult's treasure vault, and give the key to me."" Or you could say, ""Stop fighting, leave this library peacefully, and don't return.""The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. The Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, the spell ends for the target upon completing it.",""`;

</script>

<div class="space-y-4">
    {#if character}
        {@const c = character}
        <div class="flex justify-between gap-2">
            <a class="flex gap-2 items-center" href="/characters/{character.id}">
                <ArrowLeft/>
                View
            </a>
        </div>

        <CharacterCard character={character}/>

        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Character Info" subtitle="This is just to help you tell characters apart, we don't use this information for anything."/>
            <label class="label">
                <span class="label-text">Name</span>
                <input type="text" class="input preset-tonal" autocomplete="off" bind:value={c.name} required>
            </label>
            <label class="label">
                <span class="label-text">Level</span>
                <input type="number" min={1} max={20} class="input preset-tonal" bind:value={c.level} required>
            </label>
            <label class="label">
                <span class="label-text">Class</span>
                <select class="select preset-tonal" bind:value={c.class} required>
                    {#each DND_CLASSES as cla}
                        <option value={cla}>{cla}</option>
                    {/each}
                </select>
            </label>
            <label class="label">
                <span class="label-text">Prepared Spells</span>
                <input type="number" min={1} max={25} class="input preset-tonal" bind:value={c.preparedLimit} required>
            </label>
        </div>

        <div class="card preset-filled-surface-100-900 p-4 space-y-4">
            <SectionHeader title="Spell Slots" subtitle="When you're happy with your spell slots, you might want to import spells below."/>
            <table class="table">
                <thead>
                <tr>
                    <th>Level</th>
                    <th>Total Slots</th>
                    <th class="text-right">Actions</th>
                </tr>
                </thead>
                <tbody>
                {#each c.spellSlots?.filter(s => s.level !== 0) as s}
                    <tr class:opacity-50={!s.total}>
                        <td>{formatSpellLevelLong(s.level)}</td>
                        <td class="text-center">{s.total}</td>
                        <td class="flex">
                            <button class="btn btn-sm" onclick={() => s.total--}>Less</button>
                            <button class="btn btn-sm" onclick={() => s.total++}>More</button>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>

        <div class="card preset-tonal p-4 space-y-4">
            <SectionHeader title="Import Spellbook" subtitle="Paste the CSV data into the box below. If you don't know where to find the data, then maybe ask a friend..."/>
            <textarea class="input" rows="5" bind:value={importData} placeholder="Paste spell CSV data here...">
                {importData}
            </textarea>

            <div class="flex gap-4">
                <button class="btn preset-tonal" onclick={() => importData = spellImportPlaceholder}>Test</button>
                <button class="btn preset-tonal" onclick={() => readClipboard()}>Read Clipboard</button>
                <button class="btn preset-filled-primary-500 grow" onclick={() => runImport()}>Import</button>
            </div>
        </div>

        <SectionHeader title="Danger Zone" subtitle="Careful. This will delete all your character data. This action is permanent."/>
        <button class="btn preset-filled-error-500" onclick={() => deleteCharacter()}>Delete Character</button>
    {/if}
</div>
