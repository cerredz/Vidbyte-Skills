"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import type { FeedbackPageState, FeedbackEntry, FeedbackAction } from "../types";

interface FeedbackContextValue {
  state: FeedbackPageState;
  filteredEntries: FeedbackEntry[];
  loadEntries: () => Promise<void>;
  toggleMark: (id: string) => Promise<void>;
  toggleSave: (id: string, collectionId?: string) => Promise<void>;
  setViewMode: (mode: "list" | "swipe") => void;
  toggleSidebar: () => void;
  toggleKeybinds: () => void;
  setSidebarTab: (tab: "collections" | "connectors" | "harness") => void;
  selectEntry: (id: string | null) => void;
  expandEntry: (id: string | null) => void;
  setSwipeIndex: (index: number) => void;
  openModal: (type: FeedbackAction, feedbackId: string) => void;
  closeModal: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedbackContext(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedbackContext must be used within a FeedbackProvider");
  }
  return ctx;
}

interface FeedbackProviderProps {
  children: ReactNode;
  value: FeedbackContextValue;
}

export function FeedbackProvider({
  children,
  value,
}: FeedbackProviderProps): React.ReactElement {
  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}
