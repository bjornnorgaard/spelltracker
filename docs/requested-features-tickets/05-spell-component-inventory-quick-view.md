# Ticket: Spell Component Inventory Quick-View

## Feature Goal

Provide a quick inventory view for spell components, with tracking for consumption by count, gold value, and other relevant component-consumption rules.

## User Value

- Players can quickly confirm whether required components are available.
- Reduces manual bookkeeping during spell casting.
- Better supports spells with consumed-costly materials.

## Scope

- Surface a component-focused inventory view.
- Track component availability and usage details:
  - quantity/count
  - gold-value-based component tracking
  - other consumption semantics as needed by spell rules

## Dependency Analysis

### Data Dependencies

- Spell data must expose component requirements with enough detail:
  - consumed vs non-consumed
  - value thresholds or exact cost constraints
  - material description text when no structured field exists
- Inventory model must support component entries with quantity and value attributes.

### Parsing/Normalization Dependencies

- If component requirements are currently unstructured text, parser/normalizer logic may be required.
- May need rules to map spell component strings to normalized inventory items.

### Logic Dependencies

- Availability checks need deterministic matching rules.
- Consumption logic should define when and how counts/value are decremented.

### UI Dependencies

- Quick-view panel or section tied to casting workflow.
- Clear indicators for:
  - available
  - insufficient quantity
  - insufficient value threshold
  - consumed on cast

## Areas Likely Affected

- Spell metadata/types
- Utility parsing/normalization modules
- Character inventory data/store
- Spell and inventory UI components

## Expected App Change Size

**Estimated impact: High**

- Likely requires schema, parsing, logic, and UI work across several modules.
- Complexity depends on quality/structure of existing component data.

## Risks

- Ambiguous component text can cause false positives/negatives.
- Overly strict matching may frustrate users.
- Edge cases for reusable focus items vs consumed components.

## Suggested Implementation Order

1. Audit current spell component data quality and structure.
2. Define normalized component/inventory schema.
3. Implement parsing/matching rules for requirements.
4. Build quick-view UI with clear availability statuses.
5. Add consumption update flow and validate edge cases.

## Open Questions

- Do we need automatic consume-on-cast or manual confirmation first?
- How should we represent equivalent components with same value?
- What minimum data model is needed before advanced matching?
