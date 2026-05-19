# Design Doc: /feedback Route — Expert Feedback Agent Frontend

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-18
**Last Updated:** 2026-05-18

---

## 1. Overview

The `/feedback` route is the frontend surface for Vidbyte's autonomous expert feedback product. It renders a real-time, neuroscience-backed feedback feed synced with the user's real-world workflows. Users can browse feedback points in two view modes (list and swipe), mark and save insights, trigger downstream Vidbyte actions (roadmaps, quizzes, exams, quickhits), and operate the entire page via keyboard shortcuts exposed through inline keybind widgets. A persistent sidebar provides collection management, connector configuration, and a workflow query harness. The route serves as the primary hub for users to consume, curate, and act on agent-generated feedback.

---

## 2. Goals & Non-Goals

### Goals

- Create the `/feedback` route with a fully keyboard-navigable interface
- Implement two feedback display modes: list (collection) view and swipe (brainrot) view
- Provide a keybind system with per-button keybind widget overlays
- Build a collapsible sidebar with collections, connectors, and workflow harness
- Enable users to mark/bookmark and save individual feedback points
- Allow users to trigger Vidbyte product actions (roadmaps, quizzes, exams, quickhits) from any feedback point
- Integrate with the existing Vidbyte backend API (`/api/skills/feedback`)
- Support real-time feedback ingestion as the autonomous agent monitors user workflows
- Provide a workflow query harness where users can ask questions about their workflow

### Non-Goals

- Implementing the backend feedback generation logic (handled by existing skill + CLI)
- Building the actual roadmap/quiz/exam/quickhit execution screens (separate routes)
- Implementing the autonomous monitoring agent itself (backend concern)
- Real-time WebSocket infrastructure (use polling initially; WebSocket upgrade is separate)
- Mobile native app (web-responsive only for this phase)
- Authentication/authorization system (assumes existing Vidbyte auth)
- Offline mode / local-first persistence

---

## 3. Background & Context

The Vidbyte Skills repository (`vidbyte-skills`) already contains the feedback generation pipeline: the `feedback-generator` skill produces structured feedback, the Python CLI (`vidbyte feedback submit`) sanitizes and HMAC-signs the payload, and submits it to `POST https://vidbyte.pro/api/skills/feedback`. The backend stores feedback entries with fields: `type`, `domain`, `conversation_id`, `file_name`, `content`, `generated_at`.

The `/feedback` route is the missing frontend surface. It must consume feedback from the backend API and render it in a neuroscience-backed, high-engagement UI that supports the full lifecycle: browse → mark → save → act.

This route does **not** exist yet. No frontend code for the Vidbyte web application is present in the `vidbyte-skills` repository — this repo contains only the skill definitions, CLI, and installer. The web application is a separate codebase (at `vidbyte.pro` frontend).

---

## 4. Requirements

### Functional Requirements

1. The `/feedback` route SHALL load feedback entries from the Vidbyte backend API.
2. The route SHALL support two view modes: **List View** (traditional collection) and **Swipe View** (card-based swipe/scroll).
3. Users SHALL be able to toggle between List View and Swipe View via a toolbar control and a keyboard shortcut.
4. Every interactive element (buttons, toggles, view modes, sidebar sections) SHALL have a discoverable keyboard shortcut.
5. Each button SHALL render a small keybind widget in its bottom-right corner displaying its shortcut.
6. The keybind widget SHALL respect a global "show keybinds" toggle (on by default, user configurable).
7. The sidebar SHALL contain three sections: **Collections** (saved/marked feedback groups), **Connectors** (integrated tools/services), **Harness** (workflow query interface).
8. The sidebar SHALL be collapsible via a toggle button and keyboard shortcut.
9. Users SHALL be able to **mark** a feedback point (toggle a marker flag) and **save** a feedback point to a collection.
10. Saved/bookmarked feedback points SHALL appear in the Collections sidebar section.
11. When a feedback point is expanded/viewed, action buttons SHALL be available: **Create Roadmap**, **Create Quiz**, **Create Exam**, **Create QuickHit**.
12. Each action button SHALL open a modal or inline form to configure and submit the action to the corresponding backend endpoint.
13. The Swipe View SHALL present feedback points as full-screen cards navigable by swipe gesture (touch) or arrow keys.
14. The List View SHALL present feedback points as a scrollable, filterable, sortable table/card list.
15. The route SHALL support filtering by domain, date range, and marked/saved status.
16. The route SHALL support sorting by date, relevance, and domain.
17. The route SHALL show a real-time indicator when the autonomous agent is actively monitoring.
18. The Harness section SHALL allow users to submit free-text questions about their workflow and receive contextual responses.
19. The route SHALL be responsive (desktop-first, usable on tablet).
20. The route SHALL handle loading, empty, and error states gracefully for all data-fetching operations.

### Non-Functional Requirements

- **Performance**: Initial page load (first contentful paint) < 2 seconds; keyboard interactions < 50ms response.
- **Accessibility**: WCAG 2.1 AA compliant; all functionality reachable via keyboard; screen reader support.
- **Scalability**: Handle 1000+ feedback entries in list view with virtualized scrolling.
- **Security**: All API calls authenticated with existing Vidbyte session token; no secrets in frontend code.
- **Observability**: Client-side error logging; key interaction events tracked.
- **Reliability**: Graceful degradation when backend is unreachable; retry with exponential backoff for failed API calls.

---

## 5. High-Level Design

The `/feedback` route is a single-page application route within the Vidbyte web app. It follows a **container/presenter** pattern with a centralized state store. The route shell (`FeedbackPage`) orchestrates layout and global state (view mode, sidebar state, keybind visibility), while individual feature components handle their own data and interactions.

**Data flow:** On mount, `FeedbackPage` fetches the feedback list from `GET /api/skills/feedback` (or equivalent frontend BFF). The response is stored in a shared state context. Both List View and Swipe View consume from the same data source — toggling views preserves scroll position and selection state. User actions (mark, save, create roadmap/quiz/exam/quickhit) dispatch mutations to the backend via dedicated API calls, and the local state optimistically updates.

**Key decisions:**
- **React + TypeScript** is assumed as the frontend framework (consistent with modern Vidbyte tooling; to be confirmed against the actual web app repo).
- **State management**: React Context + useReducer for route-level state; no external library needed for this scope.
- **Styling**: Tailwind CSS (or whatever the existing app uses — aligned during implementation).
- **Virtual scrolling**: `@tanstack/react-virtual` for the list view to handle large feedback sets.
- **Keyboard shortcuts**: Custom `useKeybind` hook + `KeybindProvider` context — shortcuts are registered per component and globally discoverable.
- **Swipe gestures**: CSS scroll-snap + touch event handlers (no external swipe library needed for initial implementation).
- **Keybind widget**: A small `KeybindBadge` component that reads from the keybind registry.

### Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                   /feedback Route                     │
├────────────┬─────────────────────────────────────────┤
│  Sidebar   │  Top Bar (view toggle, filters, sort)   │
│            ├─────────────────────────────────────────┤
│  ◾ Coll.   │                                         │
│  ◾ Conn.   │    List View  │  Swipe View             │
│  ◾ Harn.   │    ───────────│────────────              │
│            │    Filterable │  Card-based              │
│  (collapse │    virtual    │  full-screen             │
│   toggle)  │    scroll     │  swipe/scroll            │
│            │                                         │
│            ├─────────────────────────────────────────┤
│            │  Action Bar (mark, save, create...)      │
│            │  Keybind Widgets on every button         │
└────────────┴─────────────────────────────────────────┘
```

The feedback data model (maps to existing backend payload):

```typescript
interface FeedbackEntry {
  id: string;
  type: "feedback";
  domain: string;
  conversation_id: string;
  file_name: string;
  content: string;        // Markdown or structured feedback text
  generated_at: string;   // ISO 8601
  // Frontend-only extensions (managed client-side or via separate endpoints):
  isMarked: boolean;
  isSaved: boolean;
  collectionId?: string;
}
```

---

## 6. Detailed Design

### 6.1 FeedbackPage (Route Shell)

**File(s):** `src/pages/FeedbackPage.tsx`
**Type:** New file

#### What it does
The top-level route component. Orchestrates layout, manages global UI state (view mode, sidebar open/closed, keybind visibility), fetches feedback data, and provides context to child components.

#### Logic / Algorithm
1. On mount, fetch `GET /api/skills/feedback` with auth headers.
2. Start a polling interval (every 15s) for real-time updates from the autonomous agent — show a subtle "live" indicator.
3. Apply client-side filtering and sorting before passing to view components.
4. Manage focus trapping for the swipe view (arrow keys navigate cards).
5. Toggle sidebar with `[` key; toggle keybind display with `?` key; toggle view mode with `v` key.
6. Render layout: sidebar (left, collapsible) + main content area (top bar + view).

#### Edge Cases & Error Handling
- **Empty state**: Show "No feedback yet — your agent is listening" with an illustration when zero entries.
- **API error**: Show error banner with retry button; do not block the UI.
- **Loading**: Skeleton cards while initial data loads.
- **Stale polling**: If polling fails, show a subtle "connection lost" indicator; retry on next interval.
- **Large datasets**: Virtual scrolling via `@tanstack/react-virtual` in list view.

---

### 6.2 List View

**File(s):** `src/components/feedback/ListView.tsx`
**Type:** New file

#### What it does
Renders feedback entries as a filterable, sortable, virtualized scroll list. Each row shows a preview card with metadata and action buttons. Designed for power users who want to scan many entries quickly.

#### Interface / API
```typescript
interface ListViewProps {
  entries: FeedbackEntry[];
  isLoading: boolean;
  onMark: (id: string) => void;
  onSave: (id: string, collectionId?: string) => void;
  onAction: (id: string, action: FeedbackAction) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}
```

#### Logic / Algorithm
1. Receive filtered/sorted entries from parent.
2. Render virtualized list using `useVirtualizer` for performance (only visible rows rendered in DOM).
3. Each row: domain badge, timestamp, truncated content preview (first 150 chars), mark/save action icons.
4. Clicking a row expands it inline (accordion pattern).
5. Expanded row shows full feedback content + action buttons (roadmap, quiz, exam, quickhit).
6. Keyboard shortcuts: `j`/`k` for next/previous row, `Enter` to expand, `m` to mark, `s` to save.

#### Edge Cases & Error Handling
- **Overflow content**: Truncate with "Show more" link; render Markdown safely (no raw HTML injection).
- **Empty filtered results**: "No results match your filters" with clear-filters button.
- **Rapid keyboard nav**: Debounce mark/save to prevent double-taps; optimistic UI update with rollback on API failure.

---

### 6.3 Swipe View (Brainrot Mode)

**File(s):** `src/components/feedback/SwipeView.tsx`
**Type:** New file

#### What it does
Presents feedback as full-screen cards navigable by horizontal swipe (touch) or left/right arrow keys. Designed for high-engagement, rapid consumption. Each card shows one feedback point in a visually rich format. Neuroscience-backed design: variable reward, pattern interruption, dual-coding (text + visual metaphor).

#### Interface / API
```typescript
interface SwipeViewProps {
  entries: FeedbackEntry[];
  isLoading: boolean;
  onMark: (id: string) => void;
  onSave: (id: string, collectionId?: string) => void;
  onAction: (id: string, action: FeedbackAction) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}
```

#### Logic / Algorithm
1. Render the current card centered, with adjacent cards partially visible (carousel-style).
2. Swipe detection: use touch events (touchstart, touchmove, touchend) with a swipe threshold of 30% card width.
3. Keyboard: left/right arrow keys navigate; up to mark, down to save (mapped intuitively).
4. Card content: feedback summary in large text, domain badge, timestamp in corner, action buttons pinned to bottom.
5. Quick actions: swipe up = mark, swipe down = save (inbox triage pattern).
6. Progress indicator: dot bar at top showing current position in the deck.
7. At end of deck: "You're all caught up" with option to restart or switch to list view.

#### Edge Cases & Error Handling
- **Single entry**: Hide navigation indicators, show the one card centered.
- **Empty**: Same empty state as list view but styled for swipe mode.
- **Swipe vs scroll conflict**: Prevent vertical page scroll while swipe gesture is active (touch-action: none on card container).
- **Animation jank**: Use CSS `transform` and `will-change` for GPU-accelerated transitions.

---

### 6.4 Keybind System

**File(s):** `src/hooks/useKeybind.ts`, `src/components/ui/KeybindBadge.tsx`, `src/context/KeybindContext.tsx`
**Type:** New files

#### What it does
A route-level keyboard shortcut registry that maps key combinations to actions. Components register shortcuts on mount and unregister on unmount. A visual `<KeybindBadge>` widget renders the shortcut on the bottom-right corner of any button it wraps. A global `showKeybinds` toggle (bound to `?`) shows/hides all badges.

#### Interface / API
```typescript
interface KeybindContextValue {
  showKeybinds: boolean;
  setShowKeybinds: (show: boolean) => void;
  registerKeybind: (id: string, keys: string, action: () => void, description: string) => void;
  unregisterKeybind: (id: string) => void;
  getKeybind: (id: string) => KeybindRegistration | undefined;
}

function useKeybind(keys: string, action: () => void, options?: {
  description: string;
  enabled?: boolean;
  scope?: "global" | "local";
}): { id: string; bindings: string };

const KeybindBadge: React.FC<{ keybindId: string; children: React.ReactNode }>;
```

#### Logic / Algorithm
1. `KeybindProvider` wraps the route, listens for `keydown` events at the document level.
2. On `keydown`, checks registered shortcuts in priority order (global > local > disabled).
3. If match found, calls `preventDefault()` and executes the registered action.
4. `useKeybind` hook: on mount, generates a unique ID and registers with context; on unmount, unregisters.
5. `KeybindBadge`: reads the registered shortcut from context by ID, renders a fixed-position `<kbd>` tag in the bottom-right corner of its parent element.
6. Shortcut display format: modifier keys shown as symbols (Ctrl, Shift, Alt), regular keys as uppercase letters. Mac: display Cmd symbol. Windows/Linux: display Ctrl.

#### Default Keybind Map

| Shortcut | Scope | Action | Description |
|----------|-------|--------|-------------|
| `v` | global | Toggle view mode | Switch between list and swipe view |
| `[` | global | Toggle sidebar | Collapse/expand sidebar |
| `?` | global | Toggle keybinds | Show/hide keybind badges |
| `j` / `ArrowDown` | local (list) | Next entry | Move selection down |
| `k` / `ArrowUp` | local (list) | Previous entry | Move selection up |
| `ArrowLeft` | local (swipe) | Previous card | Previous feedback card |
| `ArrowRight` | local (swipe) | Next card | Next feedback card |
| `m` | local | Mark/unmark | Toggle mark on selected entry |
| `s` | local | Save | Save selected entry to collection |
| `r` | local | Create roadmap | Open roadmap creation modal |
| `q` | local | Create quiz | Open quiz creation modal |
| `e` | local | Create exam | Open exam creation modal |
| `h` | local | Create quickhit | Open quickhit creation modal |
| `Enter` | local | Expand/view | Expand selected feedback entry |
| `Escape` | global | Close/dismiss | Close any open modal or expanded view |
| `/` | global | Focus search | Focus the search/filter input |
| `Ctrl+f` | global | Open filters | Open the filter panel |

#### Edge Cases & Error Handling
- **Shortcut conflict**: If two components register the same shortcut, the most recently registered wins; log warning in development mode.
- **Input focus exemption**: Global shortcuts suppressed when an `<input>`, `<textarea>`, or `[contenteditable]` element is focused (unless the shortcut includes Ctrl/Cmd modifier).
- **Disabled state**: Components disable their keybinds via the `enabled: false` option.
- **Badge positioning**: If the parent button lacks `position: relative`, the badge component wraps children in a relative container internally.

---

### 6.5 Sidebar

**File(s):** `src/components/feedback/Sidebar.tsx`, `src/components/feedback/CollectionsPanel.tsx`, `src/components/feedback/ConnectorsPanel.tsx`, `src/components/feedback/HarnessPanel.tsx`
**Type:** New files

#### What it does
A collapsible left sidebar with three tabbed panels: Collections (saved feedback groups), Connectors (integrated external tools/services), and Harness (workflow query interface). Tab navigation with keyboard accessible (Ctrl+1/2/3).

#### Interface / API
```typescript
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}

type SidebarTab = "collections" | "connectors" | "harness";
```

#### Logic / Algorithm
1. **Collapse/expand**: Animated width transition (250ms ease). Collapsed: 0px width, icon-only toggle button at left edge. Expanded: 300px width.
2. **Collections Panel**: Lists user's saved collections (folders). Each collection entry shows name + count of saved feedback items. Click filters main view to that collection. "New collection" button with inline name input. Stretch goal: drag-and-drop feedback cards into collections.
3. **Connectors Panel**: Lists connected tools/services that feed the feedback agent. Status indicators: green dot (connected), grey (disconnected), red (error). "Add connector" button opens OAuth flow or API key setup modal. V1 connectors: GitHub, VS Code extension, terminal/shell watcher, browser extension.
4. **Harness Panel**: Free-text input area for workflow questions. "Ask" submission button. Response rendered as sanitized Markdown. Session-scoped conversation history below the input.

#### Edge Cases & Error Handling
- **No collections**: Empty state with CTA: "Create your first collection to start saving feedback."
- **No connectors**: Empty state: "Connect your tools to unlock autonomous feedback."
- **Harness error**: Error state with retry button; timeout after 30s of no response; loading spinner during request.
- **Collapsed sidebar**: Small icon badges show unread feedback count and active connector count.

---

### 6.6 Action Modals (Roadmap, Quiz, Exam, QuickHit)

**File(s):** `src/components/feedback/actions/CreateRoadmapModal.tsx`, `src/components/feedback/actions/CreateQuizModal.tsx`, `src/components/feedback/actions/CreateExamModal.tsx`, `src/components/feedback/actions/CreateQuickHitModal.tsx`
**Type:** New files

#### What it does
When a user clicks an action button on a feedback point, a modal opens with a pre-populated form to create the corresponding Vidbyte product. Submitting sends the feedback context + user configuration to the backend product creation endpoint.

#### Interface / API
```typescript
type FeedbackAction = "roadmap" | "quiz" | "exam" | "quickhit";

interface ActionModalProps {
  feedbackEntry: FeedbackEntry;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: ActionConfig) => Promise<void>;
}

interface ActionConfig {
  feedbackId: string;
  type: FeedbackAction;
  title?: string;
  roadmapLength?: "short" | "medium" | "long";  // Roadmap only
  quizQuestionCount?: number;                     // Quiz only
  examDuration?: number;                          // Exam only (minutes)
  quickHitFocus?: string;                         // QuickHit only
}
```

#### Logic / Algorithm
1. Modal opens with title field pre-filled from feedback summary text.
2. Type-specific configuration fields rendered conditionally.
3. "Create" button triggers `POST /api/products/{type}` with action config and feedback context.
4. On success: modal closes, success toast with deep link to new product page.
5. On error: inline error message displayed; user can retry.
6. Modal: focus trapped, closes on Escape, closes on backdrop click (configurable).

#### Edge Cases & Error Handling
- **API timeout (>10s)**: Show cancel button to abort; progress indicator during request.
- **Duplicate submission**: Submit button disabled after first click; backend uses idempotency key.
- **Validation**: Title required (min 3 chars); numeric inputs must be positive integers.

---

### 6.7 Feedback Card (Shared Component)

**File(s):** `src/components/feedback/FeedbackCard.tsx`
**Type:** New file

#### What it does
The reusable card component used in both List View (compact row) and Swipe View (full card). Renders feedback content with metadata, mark/save toggle state, and action buttons.

#### Interface / API
```typescript
interface FeedbackCardProps {
  entry: FeedbackEntry;
  variant: "list" | "swipe";
  isExpanded: boolean;
  isSelected: boolean;
  onMark: () => void;
  onSave: () => void;
  onAction: (action: FeedbackAction) => void;
  onExpand: () => void;
}
```

#### Logic / Algorithm
1. **List variant**: Compact horizontal card — domain badge, timestamp, truncated content preview, mark/save icon row.
2. **Swipe variant**: Full-screen card — large typography, centered summary content, bottom-pinned action bar.
3. Mark indicator: colored corner triangle or filled star icon when marked; toggles on click.
4. Save indicator: bookmark icon; filled when saved to a collection.
5. Action buttons: visible when card expanded (list) or always visible in bottom bar (swipe).
6. Content rendered as sanitized Markdown — safe HTML subset only; no scripts, no event handlers.

#### Edge Cases & Error Handling
- **Long content**: Truncated with gradient fade in list variant; full text with overflow scroll in swipe variant.
- **Empty content**: "No details available" placeholder text.
- **Rapid clicking**: Optimistic UI update for mark/save; rollback to previous state if API call fails.

---

## 7. Data Model Changes

N/A — The frontend consumes the existing backend API. The `FeedbackEntry` type is a client-side mapping of the existing backend payload. No new database schema changes are required within the scope of this frontend design.

### 7.1 Client-Side State Shape (In-Memory Only)

**Change type:** New (React state, not persisted)

```typescript
interface FeedbackPageState {
  entries: FeedbackEntry[];
  isLoading: boolean;
  error: Error | null;
  viewMode: "list" | "swipe";
  sidebarOpen: boolean;
  showKeybinds: boolean;
  activeSidebarTab: "collections" | "connectors" | "harness";
  filters: {
    domain?: string;
    dateFrom?: string;
    dateTo?: string;
    isMarked?: boolean;
    isSaved?: boolean;
    collectionId?: string;
    search?: string;
  };
  sort: {
    field: "generated_at" | "domain" | "relevance";
    direction: "asc" | "desc";
  };
  selectedEntryId: string | null;
  expandedEntryId: string | null;
  swipeIndex: number;
  activeModal: null | { type: FeedbackAction; feedbackId: string };
}
```

---

## 8. API Changes

N/A — The frontend consumes existing or to-be-created backend endpoints. No API changes are defined in this design doc because the backend API surface is outside the scope of this repo. The endpoints below are assumed; confirmation against the actual Vidbyte web backend is required.

### 8.1 Expected Backend Endpoints (To Be Confirmed)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/skills/feedback` | List feedback entries for authenticated user (paginated) |
| `GET` | `/api/skills/feedback/:id` | Get single feedback entry with full detail |
| `PATCH` | `/api/skills/feedback/:id` | Update mark/save status for a feedback entry |
| `POST` | `/api/products/roadmap` | Create a roadmap from a feedback context |
| `POST` | `/api/products/quiz` | Create a quiz from a feedback context |
| `POST` | `/api/products/exam` | Create an exam from a feedback context |
| `POST` | `/api/products/quickhit` | Create a quickhit from a feedback context |
| `GET` | `/api/collections` | List user's feedback collections |
| `POST` | `/api/collections` | Create a new feedback collection |
| `PATCH` | `/api/collections/:id` | Add/remove feedback items from a collection |
| `GET` | `/api/connectors` | List connected tools with status |
| `POST` | `/api/harness/ask` | Submit a workflow question to the feedback agent |
| `GET` | `/api/harness/conversation` | Get harness conversation history for current session |

**Note:** These endpoints are proposed. Some may already exist; others will need to be created. The frontend implementation should use a configurable API client that can adapt to the actual endpoint shape.

---

## 9. File Change Manifest

All files are **new** since the `/feedback` route does not exist yet. Paths are relative to the **web application root** (not the `vidbyte-skills` repo).

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `src/pages/FeedbackPage.tsx` | Route shell: layout, state orchestration, data fetching |
| CREATE | `src/components/feedback/ListView.tsx` | List/collection view for feedback entries |
| CREATE | `src/components/feedback/SwipeView.tsx` | Swipe/card view for feedback entries |
| CREATE | `src/components/feedback/FeedbackCard.tsx` | Shared feedback card component (both views) |
| CREATE | `src/components/feedback/Sidebar.tsx` | Sidebar container with tab navigation |
| CREATE | `src/components/feedback/CollectionsPanel.tsx` | Collections tab content |
| CREATE | `src/components/feedback/ConnectorsPanel.tsx` | Connectors tab content |
| CREATE | `src/components/feedback/HarnessPanel.tsx` | Harness tab content (workflow Q&A) |
| CREATE | `src/components/feedback/actions/CreateRoadmapModal.tsx` | Roadmap creation modal |
| CREATE | `src/components/feedback/actions/CreateQuizModal.tsx` | Quiz creation modal |
| CREATE | `src/components/feedback/actions/CreateExamModal.tsx` | Exam creation modal |
| CREATE | `src/components/feedback/actions/CreateQuickHitModal.tsx` | QuickHit creation modal |
| CREATE | `src/components/feedback/FeedbackFilterBar.tsx` | Filter + sort toolbar |
| CREATE | `src/components/ui/KeybindBadge.tsx` | Inline keybind indicator widget |
| CREATE | `src/context/FeedbackContext.tsx` | Feedback route state context + provider |
| CREATE | `src/context/KeybindContext.tsx` | Keybind registry context + provider |
| CREATE | `src/hooks/useKeybind.ts` | Keyboard shortcut registration hook |
| CREATE | `src/hooks/useFeedback.ts` | Feedback data fetching + caching hook |
| CREATE | `src/hooks/usePolling.ts` | Generic polling hook for real-time updates |
| CREATE | `src/types/feedback.ts` | TypeScript type definitions for feedback domain |
| CREATE | `src/api/feedback.ts` | API client functions for feedback endpoints |
| MODIFY | Router config file | Register `/feedback` route |
| MODIFY | Main navigation component | Add "Feedback" link to nav |

**Summary: 22 new files, 2 modified files.**

---

## 10. Testing Plan

### Unit Tests

| Component/Hook | Test Scenario |
|----------------|---------------|
| `useKeybind` | should register shortcut on mount and unregister on unmount |
| `useKeybind` | should fire action on matching keydown event |
| `useKeybind` | should not fire when disabled via options |
| `useKeybind` | should suppress single-key shortcuts when input is focused (no modifier) |
| `useKeybind` | should fire modifier-key shortcuts even when input is focused |
| `FeedbackCard` | should render truncated content preview in list variant |
| `FeedbackCard` | should render full content in swipe variant |
| `FeedbackCard` | should show mark indicator when entry.isMarked is true |
| `FeedbackCard` | should call onMark callback when mark button is clicked |
| `FeedbackCard` | should show action buttons only when expanded (list) or always (swipe) |
| `KeybindBadge` | should render correct key symbols from context |
| `KeybindBadge` | should not render when showKeybinds context is false |
| `Sidebar` | should render all three tab buttons |
| `Sidebar` | should switch active tab on click |
| `Sidebar` | should apply collapsed class when isOpen is false |
| `ListView` | should render empty state when entries array is empty |
| `ListView` | should render skeleton loaders when isLoading is true |
| `ListView` | should call onSelect with entry id on row click |
| `SwipeView` | should navigate to next card on right arrow key |
| `SwipeView` | should show end-of-deck message when on last card |
| `FeedbackPage` | should call fetch API on mount |
| `FeedbackPage` | should render error banner when API call fails |
| `FeedbackPage` | should toggle viewMode state on 'v' key press |

### Integration Tests

| Test | Description |
|------|-------------|
| Full route render | Mount FeedbackPage with mocked API; assert entries render in list view; toggle to swipe view; toggle keybind badges |
| Mark/save flow | Click mark on entry; assert optimistic UI update; assert PATCH API called; assert rollback on API failure |
| Action modal flow | Expand entry; click "Create Quiz"; fill form; submit; assert modal closes; assert success toast appears |
| Keyboard navigation | Render list view; press `j` three times; assert third row has selection class; press `Enter`; assert row expanded |
| Sidebar harness flow | Open harness tab; type question in input; click ask; assert loading state; assert response renders in Markdown |

### Manual / QA Test Cases

1. **Empty state**: Navigate to `/feedback` with 0 entries — see illustration and "your agent is listening" message.
2. **View toggle**: Press `v` 5 times — view toggles between list and swipe, preserving selected entry.
3. **Keyboard list nav**: Press `j`/`k` — selection highlight moves up/down with visible focus ring, respecting list bounds.
4. **Swipe gesture**: On touch device, swipe left on card — next card animates in from right with smooth transition.
5. **Action modal**: Expand entry → click "Create Quiz" → form pre-filled with feedback title → submit → success toast.
6. **Sidebar collapse**: Press `[` — sidebar collapses; press `[` again — sidebar expands; animation is smooth 250ms.
7. **Keybind toggle**: Press `?` — all keybind badges disappear; press `?` again — badges reappear.
8. **Mark/unmark**: Click mark star on entry — visual indicator appears; click again — indicator removed.
9. **Harness query**: Open harness → type "What patterns am I repeating in my workflow?" → submit → agent response renders.
10. **Filter by domain**: Open filter dropdown → select "software-engineering" → list refreshes showing only matching entries.

---

## 11. Dependencies & External Services

| Dependency | Version | Purpose | Risk Level |
|------------|---------|---------|------------|
| React | ^18.x (assumed) | UI component framework | Low |
| TypeScript | ^5.x (assumed) | Type safety and developer experience | Low |
| Tailwind CSS | ^3.x (assumed) | Utility-first styling | Low |
| `@tanstack/react-virtual` | ^3.x | Virtualized list rendering | Low |
| Vidbyte Backend API | `https://vidbyte.pro/api/*` | Feedback data, product creation, collections, harness | **Medium** — API shapes need confirmation; some endpoints may not exist yet |
| Vidbyte Auth | Existing session mechanism | API request authentication | Low — already established |

---

## 12. Rollout & Deployment

- **Feature flag**: `FEEDBACK_ROUTE_ENABLED` — controls route registration and nav link visibility.
- **Breaking change**: No. This is a net-new route. No existing routes, components, or APIs are modified.
- **Deployment order**:
  1. Backend endpoints confirmed/created and deployed to staging.
  2. Frontend route deployed behind feature flag (disabled by default).
  3. QA verification on staging with flag enabled for test users.
  4. Gradual production rollout: 10% → 50% → 100% of users.
- **Rollback**: Disable feature flag → remove route from router → revert frontend deploy. No data migration to reverse.

---

## 13. Open Questions

- [ ] **What is the actual frontend tech stack?** React, Next.js, Vue, Svelte, or something else? This design assumes React + TypeScript + Tailwind CSS. Must be confirmed against the Vidbyte web app repository.
- [ ] **Where is the web app repo?** This design doc lives in `vidbyte-skills` but the implementation target is the Vidbyte web application repository. The web app repo must be identified before implementation begins.
- [ ] **What backend endpoints actually exist?** Section 8.1 lists assumed endpoints. Confirm which exist, which need creating, and what the exact response shapes are.
- [ ] **What auth mechanism does the frontend use?** Session cookies? Bearer tokens? JWT? Need to align API client implementation.
- [ ] **Should feedback detail be inline expand or a separate route?** (`/feedback/:id`). Design uses inline expand; confirm preference.
- [ ] **Real-time updates: polling vs WebSocket vs SSE?** Design uses 15s polling for V1. Should we plan a WebSocket/SSE upgrade path?
- [ ] **What is the exact "brainrot swipe" UX?** Tinder-style horizontal cards? Snapchat stories? TikTok vertical? Design implements horizontal card stack (Tinder-style). Confirm or adjust.
- [ ] **Should collections be backend-persisted or local-only?** Design assumes backend-synced collections. Confirm backend support.
- [ ] **What specific connectors are planned for V1?** Design lists GitHub, VS Code, terminal, browser extension. Confirm priority.
- [ ] **Is there an existing design system or component library?** Need to match existing button styles, spacing scale, typography, color tokens, modal patterns, toast patterns.

---

## 14. Alternatives Considered

### Alternative 1: Separate routes for list and swipe views
- **What:** `/feedback/list` and `/feedback/swipe` as distinct routes instead of a toggle.
- **Why rejected:** Users switch modes frequently; separate routes add URL management complexity. Single route with `?view=swipe` query param is simpler, shareable, and preserves filter/sort state.

### Alternative 2: Third-party swipe library (react-tinder-card, react-swipeable)
- **What:** Use a pre-built swipe card library instead of custom implementation.
- **Why rejected:** Adds a dependency. The required swipe UX is simple enough (horizontal pan + snap) to implement with CSS scroll-snap and pointer/touch events. Avoids bundle size increase and potential library abandonment risk.

### Alternative 3: External state management (Redux, Zustand)
- **What:** Use a dedicated state management library for the route.
- **Why rejected:** Route-level state shape is simple (one page's worth of UI state). React Context + useReducer handles it cleanly. Adding a library for a single route is premature abstraction; can migrate if needed later.

### Alternative 4: Vertical swipe (TikTok/Snapchat-style)
- **What:** Cards swipe vertically (up/down) instead of horizontally (left/right).
- **Why not chosen (deferred):** Horizontal swipe maps better to desktop interaction (arrow keys L/R match spatial model). Vertical swipe conflicts with page scroll and is more natural on mobile. Vertical swipe can be added as an option for mobile users later.

### Alternative 5: Static keybind config file (JSON/YAML)
- **What:** Define all keyboard shortcuts in a centralized configuration file.
- **Why rejected:** Component-local registration (each component owning its shortcuts) keeps keybinds self-documenting and co-located with the UI they control. Prevents orphaned shortcuts when components are removed. The context provider still gives global discoverability (e.g., for a cheat sheet).
