"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import type { FeedbackEntry, FeedbackAction } from "../types";
import { useFeedbackContext } from "../context/FeedbackContext";
import { FeedbackCard } from "./FeedbackCard";
import { useKeybind } from "../hooks/useKeybind";

export const SwipeView: React.FC = () => {
  const {
    filteredEntries,
    state,
    toggleMark,
    toggleSave,
    openModal,
    setSwipeIndex,
  } = useFeedbackContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const currentEntry = filteredEntries[state.swipeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < filteredEntries.length) {
        setSwipeIndex(index);
      }
    },
    [filteredEntries.length, setSwipeIndex],
  );

  useKeybind("ArrowLeft", () => goTo(state.swipeIndex - 1), {
    description: "Previous card",
    enabled: state.viewMode === "swipe",
  });

  useKeybind("ArrowRight", () => goTo(state.swipeIndex + 1), {
    description: "Next card",
    enabled: state.viewMode === "swipe",
  });

  useKeybind(
    "ArrowUp",
    () => {
      if (currentEntry) toggleMark(currentEntry.id);
    },
    {
      description: "Mark card",
      enabled: state.viewMode === "swipe",
    },
  );

  useKeybind(
    "ArrowDown",
    () => {
      if (currentEntry) toggleSave(currentEntry.id);
    },
    {
      description: "Save card",
      enabled: state.viewMode === "swipe",
    },
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragStart(e.clientX);
    setIsDragging(true);
    setDragOffset(0);
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || dragStart === null) return;
      setDragOffset(e.clientX - dragStart);
    },
    [isDragging, dragStart],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStart(null);

    if (dragOffset < -80) {
      goTo(state.swipeIndex + 1);
    } else if (dragOffset > 80) {
      goTo(state.swipeIndex - 1);
    }

    setDragOffset(0);
  }, [isDragging, dragOffset, goTo, state.swipeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.viewMode !== "swipe") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(state.swipeIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(state.swipeIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.viewMode, state.swipeIndex, goTo]);

  if (state.isLoading) {
    return (
      <div
        className="swipe-view swipe-view--loading"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#6b7280",
          fontSize: "18px",
        }}
      >
        Loading feedback...
      </div>
    );
  }

  if (filteredEntries.length === 0) {
    return (
      <div
        className="swipe-view swipe-view--empty"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#6b7280",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>{state.error ? "\u26A0" : "\u{1F4AD}"}</div>
        <p style={{ fontSize: "18px", margin: "0 0 8px" }}>
          {state.error ? "Failed to load feedback" : "No feedback yet"}
        </p>
        <p style={{ fontSize: "14px", margin: 0 }}>
          {state.error ? "Check your connection and try again" : "Your agent is listening for workflow patterns"}
        </p>
      </div>
    );
  }

  const transformStyle = isDragging
    ? {
        transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.02}deg)`,
        transition: "none",
        cursor: "grabbing",
      }
    : {
        transform: "translateX(0) rotate(0deg)",
        transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
        cursor: "grab",
      };

  return (
    <div
      className="swipe-view"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "20px",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          padding: "8px 0 20px",
        }}
      >
        {filteredEntries.map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === state.swipeIndex ? "20px" : "6px",
              height: "6px",
              borderRadius: "3px",
              backgroundColor:
                i === state.swipeIndex ? "#6366f1" : "rgba(255,255,255,0.15)",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "none",
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        {currentEntry && (
          <div
            style={{
              ...transformStyle,
              width: "100%",
              maxWidth: "500px",
              height: "100%",
              maxHeight: "600px",
              willChange: "transform",
            }}
          >
            <FeedbackCard
              entry={currentEntry}
              variant="swipe"
              isExpanded
              isSelected
              onMark={() => toggleMark(currentEntry.id)}
              onSave={() => toggleSave(currentEntry.id)}
              onAction={(action: FeedbackAction) =>
                openModal(action, currentEntry.id)
              }
              onExpand={() => {}}
            />
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "12px 0 4px",
          fontSize: "13px",
          color: "#6b7280",
        }}
      >
        {state.swipeIndex + 1} / {filteredEntries.length}
        {state.swipeIndex === filteredEntries.length - 1 && (
          <span style={{ marginLeft: "8px", color: "#22c55e" }}>
            \u2714 You're all caught up!
          </span>
        )}
      </div>
    </div>
  );
};
