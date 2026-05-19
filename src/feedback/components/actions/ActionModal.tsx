"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { FeedbackEntry, FeedbackAction, ActionConfig } from "../../types";
import { useFeedbackContext } from "../context/FeedbackContext";
import { createProduct } from "../api/client";
import { useKeybind } from "../hooks/useKeybind";

interface ActionModalProps {
  feedbackEntry: FeedbackEntry;
  actionType: FeedbackAction;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  feedbackEntry,
  actionType,
}) => {
  const { closeModal } = useFeedbackContext();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [roadmapLength, setRoadmapLength] = useState<"short" | "medium" | "long">("medium");
  const [quizCount, setQuizCount] = useState(5);
  const [examDuration, setExamDuration] = useState(30);
  const [quickHitFocus, setQuickHitFocus] = useState("");

  useEffect(() => {
    setTitle(
      feedbackEntry.content.slice(0, 60).replace(/[#*`\n]/g, "").trim() ||
        `New ${actionType}`,
    );
  }, [feedbackEntry, actionType]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const config: ActionConfig = {
        feedbackId: feedbackEntry.id,
        type: actionType,
        title: title.trim(),
        ...(actionType === "roadmap" ? { roadmapLength } : {}),
        ...(actionType === "quiz" ? { quizQuestionCount: quizCount } : {}),
        ...(actionType === "exam" ? { examDuration } : {}),
        ...(actionType === "quickhit" ? { quickHitFocus } : {}),
      };

      const result = await createProduct(config);
      setSuccess(result.url);

      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  }, [title, actionType, feedbackEntry.id, roadmapLength, quizCount, examDuration, quickHitFocus, closeModal]);

  useKeybind("Escape", closeModal, {
    description: "Close modal",
    scope: "global",
  });

  const actionLabel =
    actionType === "roadmap"
      ? "Roadmap"
      : actionType === "quiz"
        ? "Quiz"
        : actionType === "exam"
          ? "Exam"
          : "QuickHit";

  if (success) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>\u2705</div>
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            {actionLabel} created successfully!
          </p>
          <a
            href={success}
            style={{ color: "#a5b4fc", fontSize: "14px" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open {actionLabel}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={closeModal}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            Create {actionLabel}
          </h2>
          <button
            onClick={closeModal}
            style={{
              background: "transparent",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            \u2715
          </button>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "#9ca3af",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#e0e0e0",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            autoFocus
          />
        </div>

        {actionType === "roadmap" && (
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#9ca3af",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Length
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["short", "medium", "long"] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => setRoadmapLength(len)}
                  style={{
                    flex: 1,
                    background:
                      roadmapLength === len
                        ? "rgba(99,102,241,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${
                      roadmapLength === len
                        ? "rgba(99,102,241,0.3)"
                        : "rgba(255,255,255,0.08)"
                    }`,
                    borderRadius: "6px",
                    padding: "8px",
                    color: roadmapLength === len ? "#a5b4fc" : "#9ca3af",
                    cursor: "pointer",
                    fontSize: "13px",
                    textTransform: "capitalize",
                  }}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        )}

        {actionType === "quiz" && (
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#9ca3af",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Number of Questions
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={quizCount}
              onChange={(e) =>
                setQuizCount(Math.max(1, Math.min(50, Number(e.target.value))))
              }
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#e0e0e0",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {actionType === "exam" && (
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#9ca3af",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Duration (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={180}
              step={5}
              value={examDuration}
              onChange={(e) =>
                setExamDuration(Math.max(5, Math.min(180, Number(e.target.value))))
              }
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#e0e0e0",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {actionType === "quickhit" && (
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#9ca3af",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Focus Area
            </label>
            <input
              type="text"
              value={quickHitFocus}
              onChange={(e) => setQuickHitFocus(e.target.value)}
              placeholder="e.g., error handling, code review..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#e0e0e0",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#fca5a5",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={closeModal}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#9ca3af",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            style={{
              background: "rgba(99,102,241,0.2)",
              color: "#a5b4fc",
              border: "1px solid rgba(99,102,241,0.3)",
              padding: "10px 24px",
              borderRadius: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 500,
              opacity: title.trim() ? 1 : 0.5,
            }}
          >
            {isSubmitting ? "Creating..." : `Create ${actionLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  backdropFilter: "blur(4px)",
};

const modalStyle: React.CSSProperties = {
  background: "#1a1a1a",
  borderRadius: "16px",
  padding: "28px",
  width: "100%",
  maxWidth: "440px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
};
