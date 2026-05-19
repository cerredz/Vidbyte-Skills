"use client";

import React from "react";
import { useFeedback } from "../hooks/useFeedback";
import { FeedbackProvider } from "../context/FeedbackContext";
import { KeybindProvider } from "../context/KeybindContext";
import { Sidebar } from "../components/Sidebar";
import { FeedbackFilterBar } from "../components/FeedbackFilterBar";
import { ListView } from "../components/ListView";
import { SwipeView } from "../components/SwipeView";
import { ActionModal } from "../components/actions/ActionModal";
import type { FeedbackEntry } from "../types";

export const FeedbackPage: React.FC = () => {
  const feedback = useFeedback();

  const activeEntry: FeedbackEntry | undefined = feedback.state.activeModal
    ? feedback.state.entries.find(
        (e: FeedbackEntry) => e.id === feedback.state.activeModal?.feedbackId,
      )
    : undefined;

  return (
    <FeedbackProvider value={feedback}>
      <KeybindProvider defaultShowKeybinds={true}>
        <div
          className="feedback-page"
          style={{
            display: "flex",
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            background: "#0a0a0a",
            color: "#e0e0e0",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <Sidebar />

          <div
            className="feedback-main"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minWidth: 0,
              height: "100%",
            }}
          >
            <FeedbackFilterBar />

            <div style={{ flex: 1, overflow: "hidden" }}>
              {feedback.state.viewMode === "list" ? (
                <ListView />
              ) : (
                <SwipeView />
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "6px 16px",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                fontSize: "10px",
                color: "#4b5563",
                gap: "12px",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    display: "inline-block",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                Agent listening
              </span>
              <span>Press ? for shortcuts</span>
            </div>
          </div>

          {feedback.state.activeModal && activeEntry && (
            <ActionModal
              feedbackEntry={activeEntry}
              actionType={feedback.state.activeModal.type}
            />
          )}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        `}</style>
      </KeybindProvider>
    </FeedbackProvider>
  );
};

export default FeedbackPage;
