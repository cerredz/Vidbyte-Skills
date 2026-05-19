"use client";

import React, { useState, useCallback } from "react";
import type { Collection } from "../../types";
import { fetchCollections, createCollection } from "../../api/client";
import { usePolling } from "../../hooks/usePolling";

export const CollectionsPanel: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch {
      // silently fail for sidebar
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  usePolling(load, { intervalMs: 30000 });

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const created = await createCollection(newName.trim());
      setCollections((prev) => [...prev, created]);
      setNewName("");
    } catch {
      // silently fail
    } finally {
      setIsCreating(false);
    }
  }, [newName]);

  if (isLoading) {
    return (
      <div style={{ padding: "12px", color: "#6b7280", fontSize: "13px" }}>
        Loading collections...
      </div>
    );
  }

  return (
    <div style={{ padding: "12px" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="New collection..."
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            padding: "6px 10px",
            color: "#e0e0e0",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <button
          onClick={handleCreate}
          disabled={isCreating || !newName.trim()}
          style={{
            background: "rgba(99,102,241,0.15)",
            color: "#a5b4fc",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: isCreating ? "not-allowed" : "pointer",
            fontSize: "13px",
            opacity: newName.trim() ? 1 : 0.5,
          }}
        >
          +
        </button>
      </div>

      {collections.length === 0 ? (
        <div style={{ color: "#6b7280", fontSize: "12px", textAlign: "center", padding: "20px 0" }}>
          Create your first collection to start saving feedback
        </div>
      ) : (
        collections.map((col) => (
          <div
            key={col.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 10px",
              borderRadius: "6px",
              marginBottom: "4px",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: "13px" }}>{col.name}</span>
            <span
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "1px 6px",
                borderRadius: "999px",
                fontSize: "11px",
                color: "#9ca3af",
              }}
            >
              {col.feedbackCount}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
