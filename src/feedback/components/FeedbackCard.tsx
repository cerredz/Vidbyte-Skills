"use client";

import React from "react";
import type { FeedbackEntry, FeedbackAction } from "../../types";
import { useKeybind } from "../../hooks/useKeybind";
import { KeybindBadge } from "../ui/KeybindBadge";

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

function severityColor(severity?: string): string {
  switch (severity) {
    case "critical":
      return "#dc2626";
    case "high":
      return "#ea580c";
    case "medium":
      return "#ca8a04";
    default:
      return "#6b7280";
  }
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  entry,
  variant,
  isExpanded,
  isSelected,
  onMark,
  onSave,
  onAction,
  onExpand,
}) => {
  const markBind = useKeybind("m", onMark, {
    description: "Mark/unmark feedback",
    enabled: isSelected || variant === "swipe",
  });

  const saveBind = useKeybind("s", onSave, {
    description: "Save to collection",
    enabled: isSelected || variant === "swipe",
  });

  if (variant === "swipe") {
    return (
      <div
        className="feedback-card feedback-card--swipe"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          backgroundColor: "#0f0f0f",
          color: "#f0f0f0",
          borderRadius: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {entry.severity && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "100%",
              backgroundColor: severityColor(entry.severity),
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "16px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "12px",
            }}
          >
            {entry.domain}
          </span>
          {entry.neurosciencePrinciple && (
            <span
              style={{
                background: "rgba(99,102,241,0.2)",
                color: "#a5b4fc",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "12px",
              }}
            >
              {entry.neurosciencePrinciple}
            </span>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            fontSize: "12px",
            color: "#9ca3af",
          }}
        >
          {formatDate(entry.generated_at)}
        </div>

        <div style={{ maxWidth: "600px", textAlign: "center", marginTop: "60px" }}>
          <p
            style={{
              fontSize: variant === "swipe" ? "22px" : "14px",
              lineHeight: 1.5,
              marginBottom: "24px",
            }}
          >
            {entry.content}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            padding: "0 40px",
          }}
        >
          <KeybindBadge keybindId={markBind.id}>
            <button
              onClick={onMark}
              style={{
                background: entry.isMarked ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.06)",
                color: entry.isMarked ? "#facc15" : "#d1d5db",
                border: `1px solid ${entry.isMarked ? "#facc15" : "rgba(255,255,255,0.1)"}`,
                padding: "8px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {entry.isMarked ? "\u2605 Marked" : "\u2606 Mark"}
            </button>
          </KeybindBadge>

          <KeybindBadge keybindId={saveBind.id}>
            <button
              onClick={onSave}
              style={{
                background: entry.isSaved ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                color: entry.isSaved ? "#22c55e" : "#d1d5db",
                border: `1px solid ${entry.isSaved ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                padding: "8px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {entry.isSaved ? "\u2713 Saved" : "\u2661 Save"}
            </button>
          </KeybindBadge>

          {(["roadmap", "quiz", "exam", "quickhit"] as FeedbackAction[]).map(
            (action) => {
              const actionBind = useKeybind(
                action === "roadmap"
                  ? "r"
                  : action === "quiz"
                    ? "q"
                    : action === "exam"
                      ? "e"
                      : "h",
                () => onAction(action),
                {
                  description: `Create ${action}`,
                  enabled: variant === "swipe",
                },
              );
              return (
                <KeybindBadge key={action} keybindId={actionBind.id}>
                  <button
                    onClick={() => onAction(action)}
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99,102,241,0.2)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Create {action.charAt(0).toUpperCase() + action.slice(1)}
                  </button>
                </KeybindBadge>
              );
            },
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`feedback-card feedback-card--list ${isSelected ? "feedback-card--selected" : ""}`}
      onClick={() => onExpand()}
      onKeyDown={(e) => {
        if (e.key === "Enter") onExpand();
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      style={{
        border: `1px solid ${isSelected ? "#6366f1" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "10px",
        padding: isExpanded ? "20px" : "14px",
        marginBottom: "8px",
        backgroundColor: isSelected ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        position: "relative",
      }}
    >
      {entry.severity && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "3px",
            height: "100%",
            borderRadius: "10px 0 0 10px",
            backgroundColor: severityColor(entry.severity),
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
            <span
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "1px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {entry.domain}
            </span>
            {entry.neurosciencePrinciple && (
              <span
                style={{
                  background: "rgba(99,102,241,0.1)",
                  color: "#a5b4fc",
                  padding: "1px 8px",
                  borderRadius: "999px",
                  fontSize: "11px",
                }}
              >
                {entry.neurosciencePrinciple}
              </span>
            )}
          </div>

          <p style={{ margin: "0 0 4px 0", fontSize: "14px", lineHeight: 1.5 }}>
            {isExpanded ? entry.content : truncate(entry.content, 150)}
          </p>

          <span style={{ fontSize: "11px", color: "#6b7280" }}>
            {formatDate(entry.generated_at)} &middot; {entry.file_name}
          </span>
        </div>

        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <KeybindBadge keybindId={markBind.id}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMark();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: entry.isMarked ? "#facc15" : "#6b7280",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
              }}
              title="Mark"
            >
              {entry.isMarked ? "\u2605" : "\u2606"}
            </button>
          </KeybindBadge>

          <KeybindBadge keybindId={saveBind.id}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: entry.isSaved ? "#22c55e" : "#6b7280",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
              }}
              title="Save"
            >
              {entry.isSaved ? "\u2665" : "\u2661"}
            </button>
          </KeybindBadge>
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {(["roadmap", "quiz", "exam", "quickhit"] as FeedbackAction[]).map(
            (action) => {
              const actionBind = useKeybind(
                action === "roadmap"
                  ? "r"
                  : action === "quiz"
                    ? "q"
                    : action === "exam"
                      ? "e"
                      : "h",
                () => onAction(action),
                { description: `Create ${action}`, enabled: isExpanded },
              );
              return (
                <KeybindBadge key={action} keybindId={actionBind.id}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(action);
                    }}
                    style={{
                      background: "rgba(99,102,241,0.1)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99,102,241,0.2)",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </button>
                </KeybindBadge>
              );
            },
          )}
        </div>
      )}
    </div>
  );
};
