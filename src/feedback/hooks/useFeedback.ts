import { useReducer, useCallback, useEffect } from "react";
import type {
  FeedbackEntry,
  FeedbackPageState,
  FeedbackActionType,
  FeedbackAction,
  ViewMode,
  SidebarTab,
  FeedbackFilters,
  SortConfig,
} from "../types";
import { fetchFeedbackEntries, updateFeedbackStatus } from "../api/client";

const initialState: FeedbackPageState = {
  entries: [],
  isLoading: true,
  error: null,
  viewMode: "list",
  sidebarOpen: true,
  showKeybinds: true,
  activeSidebarTab: "collections",
  filters: {},
  sort: { field: "generated_at", direction: "desc" },
  selectedEntryId: null,
  expandedEntryId: null,
  swipeIndex: 0,
  activeModal: null,
};

function feedbackReducer(
  state: FeedbackPageState,
  action: FeedbackActionType,
): FeedbackPageState {
  switch (action.type) {
    case "SET_ENTRIES":
      return { ...state, entries: action.payload, isLoading: false, error: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload, swipeIndex: 0 };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "TOGGLE_KEYBINDS":
      return { ...state, showKeybinds: !state.showKeybinds };
    case "SET_SIDEBAR_TAB":
      return { ...state, activeSidebarTab: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "CLEAR_FILTERS":
      return { ...state, filters: {} };
    case "SET_SORT":
      return { ...state, sort: action.payload };
    case "SELECT_ENTRY":
      return { ...state, selectedEntryId: action.payload };
    case "EXPAND_ENTRY":
      return {
        ...state,
        expandedEntryId:
          state.expandedEntryId === action.payload ? null : action.payload,
      };
    case "SET_SWIPE_INDEX":
      return {
        ...state,
        swipeIndex: Math.max(
          0,
          Math.min(action.payload, state.entries.length - 1),
        ),
      };
    case "TOGGLE_MARK": {
      const entries = state.entries.map((e) =>
        e.id === action.payload ? { ...e, isMarked: !e.isMarked } : e,
      );
      return { ...state, entries };
    }
    case "TOGGLE_SAVE": {
      const entries = state.entries.map((e) =>
        e.id === action.payload.id
          ? { ...e, isSaved: !e.isSaved, collectionId: action.payload.collectionId }
          : e,
      );
      return { ...state, entries };
    }
    case "OPEN_MODAL":
      return { ...state, activeModal: action.payload };
    case "CLOSE_MODAL":
      return { ...state, activeModal: null };
    default:
      return state;
  }
}

export function useFeedback() {
  const [state, dispatch] = useReducer(feedbackReducer, initialState);

  const loadEntries = useCallback(async () => {
    try {
      const entries = await fetchFeedbackEntries();
      dispatch({ type: "SET_ENTRIES", payload: entries });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err as Error });
    }
  }, []);

  const toggleMark = useCallback(
    async (id: string) => {
      const entry = state.entries.find((e) => e.id === id);
      if (!entry) return;

      dispatch({ type: "TOGGLE_MARK", payload: id });

      try {
        await updateFeedbackStatus(id, { isMarked: !entry.isMarked });
      } catch {
        dispatch({ type: "TOGGLE_MARK", payload: id });
      }
    },
    [state.entries],
  );

  const toggleSave = useCallback(
    async (id: string, collectionId?: string) => {
      const entry = state.entries.find((e) => e.id === id);
      if (!entry) return;

      dispatch({
        type: "TOGGLE_SAVE",
        payload: { id, collectionId: entry.isSaved ? undefined : collectionId },
      });

      try {
        await updateFeedbackStatus(id, {
          isSaved: !entry.isSaved,
          collectionId: entry.isSaved ? undefined : collectionId,
        });
      } catch {
        dispatch({
          type: "TOGGLE_SAVE",
          payload: { id, collectionId: entry.isSaved ? undefined : collectionId },
        });
      }
    },
    [state.entries],
  );

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  }, []);

  const toggleKeybinds = useCallback(() => {
    dispatch({ type: "TOGGLE_KEYBINDS" });
  }, []);

  const setSidebarTab = useCallback((tab: SidebarTab) => {
    dispatch({ type: "SET_SIDEBAR_TAB", payload: tab });
  }, []);

  const setFilters = useCallback((filters: Partial<FeedbackFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const setSort = useCallback((sort: SortConfig) => {
    dispatch({ type: "SET_SORT", payload: sort });
  }, []);

  const selectEntry = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_ENTRY", payload: id });
  }, []);

  const expandEntry = useCallback((id: string | null) => {
    dispatch({ type: "EXPAND_ENTRY", payload: id });
  }, []);

  const setSwipeIndex = useCallback((index: number) => {
    dispatch({ type: "SET_SWIPE_INDEX", payload: index });
  }, []);

  const openModal = useCallback(
    (type: FeedbackAction, feedbackId: string) => {
      dispatch({ type: "OPEN_MODAL", payload: { type, feedbackId } });
    },
    [],
  );

  const closeModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, []);

  const filteredEntries = state.entries
    .filter((entry) => {
      if (state.filters.domain && entry.domain !== state.filters.domain)
        return false;
      if (state.filters.isMarked !== undefined && entry.isMarked !== state.filters.isMarked)
        return false;
      if (state.filters.isSaved !== undefined && entry.isSaved !== state.filters.isSaved)
        return false;
      if (state.filters.collectionId && entry.collectionId !== state.filters.collectionId)
        return false;
      if (state.filters.search) {
        const query = state.filters.search.toLowerCase();
        if (
          !entry.content.toLowerCase().includes(query) &&
          !entry.domain.toLowerCase().includes(query) &&
          !entry.file_name.toLowerCase().includes(query)
        )
          return false;
      }
      if (state.filters.dateFrom) {
        if (new Date(entry.generated_at) < new Date(state.filters.dateFrom))
          return false;
      }
      if (state.filters.dateTo) {
        if (new Date(entry.generated_at) > new Date(state.filters.dateTo))
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dir = state.sort.direction === "asc" ? 1 : -1;
      if (state.sort.field === "generated_at") {
        return (
          dir *
          (new Date(a.generated_at).getTime() -
            new Date(b.generated_at).getTime())
        );
      }
      if (state.sort.field === "domain") {
        return dir * a.domain.localeCompare(b.domain);
      }
      if (state.sort.field === "relevance") {
        const aScore = (a.isMarked ? 2 : 0) + (a.isSaved ? 1 : 0);
        const bScore = (b.isMarked ? 2 : 0) + (b.isSaved ? 1 : 0);
        return dir * (bScore - aScore);
      }
      return 0;
    });

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    state,
    filteredEntries,
    dispatch,
    loadEntries,
    toggleMark,
    toggleSave,
    setViewMode,
    toggleSidebar,
    toggleKeybinds,
    setSidebarTab,
    setFilters,
    clearFilters,
    setSort,
    selectEntry,
    expandEntry,
    setSwipeIndex,
    openModal,
    closeModal,
  };
}
