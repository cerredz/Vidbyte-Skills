export interface FeedbackEntry {
  id: string;
  type: "feedback";
  domain: string;
  conversation_id: string;
  file_name: string;
  content: string;
  generated_at: string;
  isMarked: boolean;
  isSaved: boolean;
  collectionId?: string;
  neurosciencePrinciple?: string;
  suggestedAction?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

export type FeedbackAction = "roadmap" | "quiz" | "exam" | "quickhit";

export interface ActionConfig {
  feedbackId: string;
  type: FeedbackAction;
  title: string;
  roadmapLength?: "short" | "medium" | "long";
  quizQuestionCount?: number;
  examDuration?: number;
  quickHitFocus?: string;
}

export type ViewMode = "list" | "swipe";

export type SidebarTab = "collections" | "connectors" | "harness";

export interface FeedbackFilters {
  domain?: string;
  dateFrom?: string;
  dateTo?: string;
  isMarked?: boolean;
  isSaved?: boolean;
  collectionId?: string;
  search?: string;
}

export interface SortConfig {
  field: "generated_at" | "domain" | "relevance";
  direction: "asc" | "desc";
}

export interface FeedbackPageState {
  entries: FeedbackEntry[];
  isLoading: boolean;
  error: Error | null;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  showKeybinds: boolean;
  activeSidebarTab: SidebarTab;
  filters: FeedbackFilters;
  sort: SortConfig;
  selectedEntryId: string | null;
  expandedEntryId: string | null;
  swipeIndex: number;
  activeModal: null | { type: FeedbackAction; feedbackId: string };
}

export interface Collection {
  id: string;
  name: string;
  feedbackCount: number;
  createdAt: string;
}

export interface Connector {
  id: string;
  name: string;
  type: "github" | "vscode" | "terminal" | "browser";
  status: "connected" | "disconnected" | "error";
  lastSyncAt?: string;
}

export interface HarnessMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

export interface KeybindRegistration {
  id: string;
  keys: string;
  action: () => void;
  description: string;
  scope: "global" | "local";
  enabled: boolean;
}

export type FeedbackActionType =
  | { type: "SET_ENTRIES"; payload: FeedbackEntry[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_KEYBINDS" }
  | { type: "SET_SIDEBAR_TAB"; payload: SidebarTab }
  | { type: "SET_FILTERS"; payload: Partial<FeedbackFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_SORT"; payload: SortConfig }
  | { type: "SELECT_ENTRY"; payload: string | null }
  | { type: "EXPAND_ENTRY"; payload: string | null }
  | { type: "SET_SWIPE_INDEX"; payload: number }
  | { type: "TOGGLE_MARK"; payload: string }
  | { type: "TOGGLE_SAVE"; payload: { id: string; collectionId?: string } }
  | { type: "OPEN_MODAL"; payload: { type: FeedbackAction; feedbackId: string } }
  | { type: "CLOSE_MODAL" };
