"use client";

import React, { useRef, useCallback } from "react";
import type { FeedbackEntry, FeedbackAction } from "../types";
import { useFeedbackContext } from "../context/FeedbackContext";
import { FeedbackCard } from "./FeedbackCard";
import { useKeybind } from "../hooks/useKeybind";

export const ListView: React.FC = () => {
  const {
    filteredEntries,
    state,
    selectEntry,
    expandEntry,
    toggleMark,
    toggleSave,
    openModal,
  } = useFeedbackContext();

  const listRef = useRef<HTMLDivElement>(null);

  const moveSelection = useCallback(
    (direction: 1 | -1) => {
      const currentIndex = filteredEntries.findIndex(
        (e) => e.id === state.selectedEntryId,
      );
      let nextIndex: number;
      if (currentIndex === -1) {
        nextIndex = direction === 1 ? 0 : filteredEntries.length - 1;
      } else {
        nextIndex = currentIndex + direction;
        if (nextIndex < 0) nextIndex = filteredEntries.length - 1;
        if (nextIndex >= filteredEntries.length) nextIndex = 0;
      }
      if (filteredEntries[nextIndex]) {
        selectEntry(filteredEntries[nextIndex].id);
        listRef.current?.children[nextIndex]?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    },
    [filteredEntries, state.selectedEntryId, selectEntry],
  );

  useKeybind("j", () => moveSelection(1), {
    description: "Next entry",
    enabled: state.viewMode === "list",
  });

  useKeybind("ArrowDown", () => moveSelection(1), {
    description: "Next entry",
    enabled: state.viewMode === "list",
  });

  useKeybind("k", () => moveSelection(-1), {
    description: "Previous entry",
    enabled: state.viewMode === "list",
  });

  useKeybind("ArrowUp", () => moveSelection(-1), {
    description: "Previous entry",
    enabled: state.viewMode === "list",
  });

  useKeybind(
    "Enter",
    () => {
      if (state.selectedEntryId) expandEntry(state.selectedEntryId);
    },
    {
      description: "Expand selected entry",
      enabled: state.viewMode === "list",
    },
  );

  if (state.isLoading) {
    return (
      <div className="list-view list-view--loading" style={{ padding: "20px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "80px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              marginBottom: "8px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (filteredEntries.length === 0) {
    return (
      <div
        className="list-view list-view--empty"
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>{state.error ? "\u26A0" : "\u{1F4AD}"}</div>
        <p style={{ fontSize: "16px", margin: "0 0 8px" }}>
          {state.error
            ? "Failed to load feedback"
            : Object.keys(state.filters).length > 0
              ? "No results match your filters"
              : "No feedback yet — your agent is listening"}
        </p>
        {state.error && (
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "rgba(99,102,241,0.1)",
              color: "#a5b4fc",
              border: "1px solid rgba(99,102,241,0.2)",
              padding: "8px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="list-view"
      ref={listRef}
      style={{ padding: "16px", overflowY: "auto", flex: 1 }}
    >
      {filteredEntries.map((entry: FeedbackEntry) => (
        <FeedbackCard
          key={entry.id}
          entry={entry}
          variant="list"
          isExpanded={state.expandedEntryId === entry.id}
          isSelected={state.selectedEntryId === entry.id}
          onMark={() => toggleMark(entry.id)}
          onSave={() => toggleSave(entry.id)}
          onAction={(action: FeedbackAction) =>
            openModal(action, entry.id)
          }
          onExpand={() => {
            selectEntry(entry.id);
            expandEntry(entry.id);
          }}
        />
      ))}
    </div>
  );
};
