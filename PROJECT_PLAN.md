# D&D 5th Edition Spelltracker - Project Development Plan

**Project Start Date:** January 29, 2026  
**Last Updated:** January 29, 2026  
**Version:** 1.0.0

---

## 📋 Project Overview

A responsive web application for tracking spells in Dungeons & Dragons 5th Edition. The app enables players and Dungeon Masters to manage spell lists, track spell slots, and reference spell details during gameplay.

### Technology Stack
- **Framework:** SvelteKit (v2.50.1) with Svelte 5 (v5.48.2)
- **Styling:** Tailwind CSS (v4.1.18) + Skeleton UI (v4.11.0)
- **Language:** TypeScript (v5.9.3)
- **Build Tool:** Vite (v7.3.1)
- **Deployment:** Vercel (adapter-vercel v6.3.1)
- **Storage:** Browser localStorage (offline-first approach)

---

## 🎯 Core Features & Requirements

### Must-Have Features (MVP)
1. ✅ **Project Scaffolding** - COMPLETED
   - SvelteKit setup with TypeScript
   - Skeleton UI integration
   - Tailwind CSS configuration
   - Basic project structure

2. ⏳ **Spell Data Management**
   - CSV parser for bulk spell import
   - Spell data model with all D&D 5e fields
   - Local storage persistence
   - CRUD operations for spells

3. ⏳ **Character Management**
   - Create/edit/delete characters
   - Character data model (name, class, level)
   - Spell slot tracking per character
   - Character selection/switching

4. ⏳ **Spellbook Management**
   - Add/remove spells to character spellbook
   - Filter spells by class, level, school
   - Search functionality
   - Sort by various criteria

5. ⏳ **Spell Details View**
   - Display full spell information
   - Component breakdown display
   - Class/subclass availability
   - Higher level spell effects

6. ⏳ **Spell Slot Tracking**
   - Visual spell slot tracker (1st-9th level)
   - Mark slots as used/available
   - Reset all slots (long rest)
   - Slot count based on class/level

7. ⏳ **Responsive Design**
   - Mobile-first approach
   - Tablet optimization
   - Desktop layout
   - Touch-friendly controls

8. ⏳ **Offline Functionality**
   - Full offline access via localStorage
   - No external API dependencies
   - Service worker for PWA (future enhancement)

### Nice-to-Have Features (Post-MVP)
- [ ] Export character data (JSON/CSV)
- [ ] Import character data
- [ ] Spell preparation tracking (for prepared casters)
- [ ] Concentration tracking
- [ ] Ritual casting indicators
- [ ] Dark/light theme toggle
- [ ] Print-friendly view
- [ ] Share spellbook via URL
- [ ] Multiple theme options
- [ ] Spell favorites/bookmarks
- [ ] Notes/annotations on spells
- [ ] Session history tracking

---

## 📐 Technical Architecture

### Data Models

#### Spell Interface
```typescript
interface Spell {
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
  optionalClasses: string[];
  subclasses: string[];
  text: string;
  atHigherLevels: string;
}
```

#### Character Interface
```typescript
interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  spellSlots: {
    [level: number]: {
      total: number;
      used: number;
    }
  };
  knownSpells: string[]; // spell IDs
  preparedSpells?: string[]; // for prepared casters
}
```

#### AppState Interface
```typescript
interface AppState {
  characters: Character[];
  activeCharacterId: string | null;
  spells: Spell[];
  filters: {
    level: string[];
    school: string[];
    class: string[];
  };
  searchQuery: string;
}
```

### Component Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── spell/
│   │   │   ├── SpellCard.svelte
│   │   │   ├── SpellList.svelte
│   │   │   ├── SpellDetail.svelte
│   │   │   └── SpellFilters.svelte
│   │   ├── character/
│   │   │   ├── CharacterSelector.svelte
│   │   │   ├── CharacterForm.svelte
│   │   │   ├── CharacterCard.svelte
│   │   │   └── SpellSlotTracker.svelte
│   │   ├── import/
│   │   │   ├── CSVImporter.svelte
│   │   │   └── SpellImportPreview.svelte
│   │   └── layout/
│   │       ├── Header.svelte
│   │       ├── Navigation.svelte
│   │       └── Footer.svelte
│   ├── stores/
│   │   ├── characters.svelte.ts
│   │   ├── spells.svelte.ts
│   │   └── ui.svelte.ts
│   ├── utils/
│   │   ├── csv-parser.ts
│   │   ├── storage.ts
│   │   ├── spell-filters.ts
│   │   └── constants.ts
│   └── types/
│       └── index.ts
└── routes/
    ├── +layout.svelte
    ├── +page.svelte (Dashboard/Home)
    ├── spells/
    │   ├── +page.svelte (Spell Browser)
    │   └── [id]/
    │       └── +page.svelte (Spell Detail)
    ├── characters/
    │   ├── +page.svelte (Character List)
    │   ├── new/
    │   │   └── +page.svelte (Create Character)
    │   └── [id]/
    │       ├── +page.svelte (Character Detail)
    │       └── edit/
    │           └── +page.svelte (Edit Character)
    └── import/
        └── +page.svelte (CSV Import)
```

### Storage Strategy
- **localStorage keys:**
  - `spelltracker:characters` - Array of Character objects
  - `spelltracker:spells` - Array of Spell objects
  - `spelltracker:activeCharacterId` - Currently selected character ID
  - `spelltracker:version` - Data version for migrations

### Utility Functions
```typescript
// Format spell level for display
function formatSpellLevel(level: number): string {
  if (level === 0) return "Cantrip";
  const suffix = ["th", "st", "nd", "rd"];
  const v = level % 100;
  return level + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

// Parse CSV spell level to number
function parseSpellLevel(levelStr: string): number {
  if (levelStr.toLowerCase().includes("cantrip")) return 0;
  return parseInt(levelStr) || 0;
}
```

---

## 📅 Development Phases

### Phase 1: Foundation & Data Layer (Week 1)
**Status:** 🔄 In Progress

#### Tasks:
- [ ] 1.1 Define TypeScript interfaces and types
- [ ] 1.2 Create localStorage utilities (get, set, clear)
- [ ] 1.3 Implement CSV parser with validation
- [ ] 1.4 Create Svelte stores for state management
  - [ ] Character store (CRUD + active selection)
  - [ ] Spell store (CRUD + filtering)
  - [ ] UI store (modals, toasts, loading states)
- [ ] 1.5 Add sample spell data for testing
- [ ] 1.6 Create constants file (spell schools, classes, etc.)
- [ ] 1.7 Create utility function for spell level display (0 → "Cantrip", 1 → "1st", etc.)

#### Success Criteria:
- [ ] All TypeScript types defined
- [ ] localStorage reads/writes successfully
- [ ] CSV parser handles example data
- [ ] Stores reactive and functional

---

### Phase 2: Character Management (Week 1-2)
**Status:** ⏳ Pending

#### Tasks:
- [ ] 2.1 Create character form component
- [ ] 2.2 Implement character CRUD operations
- [ ] 2.3 Build character selector component
- [ ] 2.4 Create character card display
- [ ] 2.5 Add character deletion confirmation
- [ ] 2.6 Implement character list page
- [ ] 2.7 Build character detail page
- [ ] 2.8 Add character edit functionality

#### Success Criteria:
- [ ] Can create characters with valid data
- [ ] Can switch between characters
- [ ] Character data persists across page reloads
- [ ] Edit/delete operations work correctly

---

### Phase 3: Spell Management (Week 2)
**Status:** ⏳ Pending

#### Tasks:
- [ ] 3.1 Create spell card component
- [ ] 3.2 Build spell list with virtualization (if needed)
- [ ] 3.3 Implement spell detail modal/page
- [ ] 3.4 Create spell filter component
  - [ ] Filter by level
  - [ ] Filter by school
  - [ ] Filter by class
- [ ] 3.5 Add search functionality
- [ ] 3.6 Implement sort options
- [ ] 3.7 Create spell browser page
- [ ] 3.8 Add "Add to Spellbook" functionality

#### Success Criteria:
- [ ] Spells display correctly with all data
- [ ] Filters work in combination
- [ ] Search returns relevant results
- [ ] Can add/remove spells from character

---

### Phase 4: Spell Slot Tracking (Week 2-3)
**Status:** ⏳ Pending

#### Tasks:
- [ ] 4.1 Create spell slot tracker component
- [ ] 4.2 Implement slot usage toggling
- [ ] 4.3 Add long rest button (reset all slots)
- [ ] 4.4 Build slot count configuration
- [ ] 4.5 Add visual indicators (used/available)
- [ ] 4.6 Implement slot recommendations by class/level
- [ ] 4.7 Add short rest recovery (for Warlocks)

#### Success Criteria:
- [ ] Slots track usage correctly
- [ ] Reset function works
- [ ] Visual feedback is clear
- [ ] Data persists properly

---

### Phase 5: CSV Import Feature (Week 3)
**Status:** ⏳ Pending

#### Tasks:
- [ ] 5.1 Create CSV import page
- [ ] 5.2 Build file upload component
- [ ] 5.3 Add CSV validation and error handling
- [ ] 5.4 Create import preview table
- [ ] 5.5 Implement bulk spell import
- [ ] 5.6 Add duplicate detection
- [ ] 5.7 Create import progress indicator
- [ ] 5.8 Add sample CSV download

#### Success Criteria:
- [ ] Can upload and parse CSV files
- [ ] Errors are clearly displayed
- [ ] Preview shows correct data
- [ ] Import adds spells to storage

---

### Phase 6: UI/UX Polish (Week 3-4)
**Status:** ⏳ Pending

#### Tasks:
- [ ] 6.1 Create app header with navigation
- [ ] 6.2 Add loading states and skeletons
- [ ] 6.3 Implement toast notifications
- [ ] 6.4 Add modal dialogs for confirmations
- [ ] 6.5 Create empty states (no characters, no spells)
- [ ] 6.6 Add animations and transitions
- [ ] 6.7 Implement error boundaries
- [ ] 6.8 Add help/tutorial tooltips
- [ ] 6.9 Create about/help page

#### Success Criteria:
- [ ] UI is intuitive and responsive
- [ ] Feedback is immediate and clear
- [ ] No confusing states
- [ ] Smooth user experience

---

### Phase 7: Responsive Design (Week 4)
**Status:** ⏳ Pending

#### Tasks:
- [ ] 7.1 Mobile layout optimization (320px - 767px)
- [ ] 7.2 Tablet layout optimization (768px - 1023px)
- [ ] 7.3 Desktop layout optimization (1024px+)
- [ ] 7.4 Touch gesture support
- [ ] 7.5 Mobile navigation menu
- [ ] 7.6 Responsive tables/grids
- [ ] 7.7 Test on various devices
- [ ] 7.8 Optimize for landscape/portrait

#### Success Criteria:
- [ ] Works on all screen sizes
- [ ] Touch controls are accessible
- [ ] No horizontal scrolling issues
- [ ] Readable on small screens

---

### Phase 8: Testing & Bug Fixes (Week 4-5)
**Status:** ⏳ Pending

#### Tasks:
- [ ] 8.1 Manual testing of all features
- [ ] 8.2 Cross-browser testing
- [ ] 8.3 Accessibility audit
- [ ] 8.4 Performance optimization
- [ ] 8.5 Fix identified bugs
- [ ] 8.6 Test localStorage edge cases
- [ ] 8.7 Test with large datasets
- [ ] 8.8 User acceptance testing

#### Success Criteria:
- [ ] No critical bugs
- [ ] Works in major browsers
- [ ] Accessible to all users
- [ ] Performance is acceptable

---

### Phase 9: Deployment & Documentation (Week 5)
**Status:** ⏳ Pending

#### Tasks:
- [ ] 9.1 Configure Vercel deployment
- [ ] 9.2 Set up environment variables
- [ ] 9.3 Test production build
- [ ] 9.4 Write user documentation
- [ ] 9.5 Create deployment guide
- [ ] 9.6 Add README instructions
- [ ] 9.7 Deploy to production
- [ ] 9.8 Monitor initial usage

#### Success Criteria:
- [ ] App is live and accessible
- [ ] Documentation is complete
- [ ] No deployment issues
- [ ] Users can access the app

---

## 🔍 Key Technical Decisions

### Why localStorage?
- Simple offline-first approach
- No backend required for MVP
- Works immediately without setup
- Sufficient for single-user app
- Can migrate to IndexedDB later if needed

### Why Skeleton UI?
- Pre-built D&D-friendly dark themes
- Comprehensive component library
- Built for Svelte 5
- Good accessibility defaults
- Reduces custom CSS needed

### Why SvelteKit?
- Modern, performant framework
- Great developer experience
- Built-in routing
- SSG capabilities for Vercel
- Svelte 5 runes for reactivity

---

## 🎨 Design Considerations

### Color Scheme
- Use Skeleton's theme system
- Consider D&D-inspired themes (crimson, skeleton, etc.)
- Ensure high contrast for readability
- Support dark mode preference

### Typography
- Clear hierarchy for spell information
- Monospace for spell components (V, S, M)
- Large touch targets on mobile
- Readable body text (16px minimum)

### Layout Patterns
- Card-based design for spells/characters
- Sidebar navigation on desktop
- Bottom tab bar on mobile
- Modal overlays for details
- List/grid toggle views

---

## 🐛 Known Issues & Discoveries

### Issue Log
*Document issues as they arise during development*

1. **Issue #1:** [To be filled during development]
   - **Status:** 
   - **Description:** 
   - **Solution:** 
   - **Date:** 

---

## 📝 Notes & Discoveries

### Development Notes
*Track important insights and decisions made during development*

1. **Note #1:** Project scaffolding completed with SvelteKit + Skeleton UI
   - Date: January 29, 2026
   - Details: Basic structure in place, ready for feature development

---

## ✅ Progress Tracking

### Overall Progress: 5%
- ✅ Project Setup (100%)
- ⏳ Data Layer (0%)
- ⏳ Character Management (0%)
- ⏳ Spell Management (0%)
- ⏳ Spell Slots (0%)
- ⏳ CSV Import (0%)
- ⏳ UI/UX (0%)
- ⏳ Responsive Design (0%)
- ⏳ Testing (0%)
- ⏳ Deployment (0%)

---

## 📚 Resources & References

### Documentation
- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [Svelte 5 Docs](https://svelte.dev/docs/svelte)
- [Skeleton UI Docs](https://skeleton.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document)

### Useful APIs
- localStorage API
- File API (for CSV upload)
- Clipboard API (for copy/paste)

### Example Spell Data Source
- Use the CSV example from README.md as template
- Can source additional spells from D&D Beyond or SRD

---

## 🚀 Future Enhancements

### Post-MVP Feature Ideas
1. **PWA Support** - Install app on mobile devices
2. **Cloud Sync** - Optional Firebase/Supabase integration
3. **Party Management** - Track multiple players' spells
4. **Encounter Mode** - Quick access during combat
5. **Spell Counter** - Track concentration and durations
6. **Custom Spells** - Add homebrew content
7. **Multi-language Support** - Internationalization
8. **Spell Comparison** - Compare multiple spells side-by-side
9. **Quick Reference Cards** - Printable spell cards
10. **Voice Commands** - Accessibility feature

---

## 📞 Contact & Collaboration

**Project Lead:** [Your Name]  
**Repository:** /Users/bjorn/Developer/Github/spelltracker  
**Issues:** Track in this document or create GitHub issues  

---

**Document Version History:**
- v1.0.0 (2026-01-29): Initial project plan created
