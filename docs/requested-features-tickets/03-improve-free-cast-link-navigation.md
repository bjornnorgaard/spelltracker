# Ticket: Improve Free-Cast Link Navigation

## Status

Done.

## Feature Goal

Allow free-cast references to be opened quickly from where the user is currently viewing. Supported behavior can include in-page scroll, route redirect to the referenced spell, and/or inline expansion of referenced spell details.

## User Value

- Removes manual scrolling through long spell lists.
- Makes free-cast references actionable and fast.
- Keeps context for users who prefer inline expansion.

## Scope

- Make free-cast references clickable.
- Support one or more navigation/display patterns:
  - in-page scroll to target spell
  - navigation/redirect to a spell location
  - inline expansion preview/details

## Dependency Analysis

### Data Dependencies

- Each free-cast reference must map to a unique spell identifier.
- Spell list entries need stable IDs/anchors for scroll targeting.

### Routing/Navigation Dependencies

- If redirect is used, routes/query/hash patterns may need extension.
- Deep-link behavior should restore/focus the referenced spell predictably.

### UI State Dependencies

- Inline expansion requires local or shared state for expanded entries.
- Need collapse behavior and state reset rules on navigation/filter changes.

### Accessibility Dependencies

- Keyboard navigation and focus management for jump/expand actions.
- Announce context changes for screen readers where appropriate.

## Areas Likely Affected

- Spell list/rendering components
- Free-cast reference rendering logic
- Router-aware logic for deep links (if enabled)
- Potentially stores for expansion state

## Expected App Change Size

**Estimated impact: Medium**

- Could be small if only anchor scroll is added.
- Could become medium/high if route-aware deep linking + inline expansion are both required.

## Risks

- Broken links if references are text-based and not normalized IDs.
- State confusion when filtering/sorting changes target positions.
- Multiple behavior modes may increase complexity if not scoped.

## Suggested Implementation Order

1. Define canonical spell ID/reference mapping.
2. Implement baseline behavior (recommended: in-page anchor scroll).
3. Add optional redirect/deep-link handling if needed.
4. Add inline expansion behavior if included in v1 scope.
5. Validate with long lists, filters, and mobile view.

## Open Questions

- Which behavior is required for v1: scroll, redirect, inline expand, or a combination?
- If multiple behaviors exist, how should the UI decide which to use?
