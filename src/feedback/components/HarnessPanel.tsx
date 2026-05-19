"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { HarnessMessage } from "../../types";
import { submitHarnessQuestion, fetchHarnessHistory } from "../../api/client";

export const HarnessPanel: React.FC = () => {
  const [messages, setMessages] = useState<HarnessMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHarnessHistory()
      .then(setMessages)
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput("");
    setIsLoading(true);

    const userMsg: HarnessMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await submitHarnessQuestion(question);
      setMessages((prev) => [...prev, result.message]);
    } catch {
      const errorMsg: HarnessMessage = {
        id: `error-${Date.now()}`,
        role: "agent",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "12px",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "12px",
          fontSize: "13px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              color: "#6b7280",
              textAlign: "center",
              padding: "30px 0",
              fontSize: "12px",
            }}
          >
            Ask any question about your workflow and get contextual answers
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "10px",
              padding: "8px 12px",
              borderRadius: "8px",
              background:
                msg.role === "user"
                  ? "rgba(99,102,241,0.1)"
                  : "rgba(255,255,255,0.04)",
              marginLeft: msg.role === "user" ? "20px" : "0",
              marginRight: msg.role === "agent" ? "20px" : "0",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#6b7280",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              {msg.role}
            </div>
            <div style={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              padding: "8px 12px",
              color: "#6b7280",
              fontSize: "13px",
              fontStyle: "italic",
            }}
          >
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "6px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask about your workflow..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "8px 12px",
            color: "#e0e0e0",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          style={{
            background: "rgba(99,102,241,0.15)",
            color: "#a5b4fc",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "13px",
            opacity: input.trim() ? 1 : 0.5,
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
};
