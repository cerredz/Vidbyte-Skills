"use client";

import React from "react";
import type { FeedbackFilters, SortConfig } from "../../types";
import { useFeedbackContext } from "../../context/FeedbackContext";
import { useKeybind } from "../../hooks/useKeybind";
import { KeybindBadge } from "../ui/KeybindBadge";

const DOMAINS = [
  "software-engineering",
  "product-management",
  "design",
  "data-science",
  "devops",
  "leadership",
];

export const FeedbackFilterBar: React.FC = () => {
  const { state, setFilters, clearFilters, setSort, setViewMode, toggleKeybinds } =
    useFeedbackContext();

  const viewBind = useKeybind("v", () => {
    setViewMode(state.viewMode === "list" ? "swipe" : "list");
  }, {
    description: "Toggle view mode",
    scope: "global",
  });

  const keybindsBind = useKeybind("?", toggleKeybinds, {
    description: "Toggle keybind display",
    scope: "global",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexWrap: "wrap",
      }}
    >
      <select
        value={state.filters.domain || ""}
        onChange={(e) =>
          setFilters({ domain: e.target.value || undefined })
        }
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          padding: "5px 10px",
          color: "#d1d5db",
          fontSize: "12px",
          outline: "none",
        }}
      >
        <option value="">All Domains</option>
        {DOMAINS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={`${state.sort.field}-${state.sort.direction}`}
        onChange={(e) => {
          const [field, direction] = e.target.value.split("-") as [
            SortConfig["field"],
            SortConfig["direction"],
          ];
          setSort({ field, direction });
        }}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          padding: "5px 10px",
          color: "#d1d5db",
          fontSize: "12px",
          outline: "none",
        }}
      >
        <option value="generated_at-desc">Newest First</option>
        <option value="generated_at-asc">Oldest First</option>
        <option value="domain-asc">Domain A-Z</option>
        <option value="domain-desc">Domain Z-A</option>
        <option value="relevance-desc">Most Relevant</option>
      </select>

      <button
        onClick={() => setFilters({ isMarked: !state.filters.isMarked })}
        style={{
          background: state.filters.isMarked
            ? "rgba(250,204,21,0.1)"
            : "transparent",
          border: `1px solid ${
            state.filters.isMarked ? "rgba(250,204,21,0.3)" : "rgba(255,255,255,0.08)"
          }`,
          color: state.filters.isMarked ? "#facc15" : "#9ca3af",
          borderRadius: "6px",
          padding: "5px 12px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        \u2605 Marked
      </button>

      <button
        onClick={() => setFilters({ isSaved: !state.filters.isSaved })}
        style={{
          background: state.filters.isSaved
            ? "rgba(34,197,94,0.1)"
            : "transparent",
          border: `1px solid ${
            state.filters.isSaved ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"
          }`,
          color: state.filters.isSaved ? "#22c55e" : "#9ca3af",
          borderRadius: "6px",
          padding: "5px 12px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        \u2665 Saved
      </button>

      {Object.keys(state.filters).length > 0 && (
        <button
          onClick={clearFilters}
          style={{
            background: "transparent",
            border: "none",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Clear filters
        </button>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ fontSize: "12px", color: "#6b7280" }}>
        {state.entries.length} feedback points
      </div>

      <KeybindBadge keybindId={keybindsBind.id}>
        <button
          onClick={toggleKeybinds}
          style={{
            background: state.showKeybinds
              ? "rgba(99,102,241,0.1)"
              : "transparent",
            border: `1px solid ${
              state.showKeybinds ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.08)"
            }`,
            color: state.showKeybinds ? "#a5b4fc" : "#9ca3af",
            borderRadius: "6px",
            padding: "5px 10px",
            cursor: "pointer",
            fontSize: "12px",
          }}
          title="Toggle keybind display"
        >
          Keybinds
        </button>
      </KeybindBadge>

      <KeybindBadge keybindId={viewBind.id}>
        <div
          style={{
            display: "flex",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setViewMode("list")}
            style={{
              background:
                state.viewMode === "list"
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
              border: "none",
              color: state.viewMode === "list" ? "#e0e0e0" : "#6b7280",
              padding: "5px 12px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            \u2630 List
          </button>
          <button
            onClick={() => setViewMode("swipe")}
            style={{
              background:
                state.viewMode === "swipe"
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
              border: "none",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              color: state.viewMode === "swipe" ? "#e0e0e0" : "#6b7280",
              padding: "5px 12px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            \u{1F4F1} Swipe
          </button>
        </div>
      </KeybindBadge>
    </div>
  );
};
