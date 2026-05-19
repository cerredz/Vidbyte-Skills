"use client";

import React, { useState, useCallback } from "react";
import type { Connector } from "../../types";
import { fetchConnectors } from "../../api/client";
import { usePolling } from "../../hooks/usePolling";

function statusColor(status: Connector["status"]): string {
  switch (status) {
    case "connected":
      return "#22c55e";
    case "error":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

function statusLabel(status: Connector["status"]): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "error":
      return "Error";
    default:
      return "Offline";
  }
}

const connectorIcons: Record<string, string> = {
  github: "\u2382",
  vscode: "\u2328",
  terminal: "\u276F",
  browser: "\u{1F310}",
};

export const ConnectorsPanel: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchConnectors();
      setConnectors(data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  usePolling(load, { intervalMs: 30000 });

  if (isLoading) {
    return (
      <div style={{ padding: "12px", color: "#6b7280", fontSize: "13px" }}>
        Loading connectors...
      </div>
    );
  }

  if (connectors.length === 0) {
    return (
      <div style={{ padding: "12px" }}>
        <div style={{ color: "#6b7280", fontSize: "12px", textAlign: "center", padding: "20px 0" }}>
          Connect your tools to unlock autonomous feedback
        </div>
        <button
          style={{
            width: "100%",
            background: "rgba(99,102,241,0.1)",
            color: "#a5b4fc",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "6px",
            padding: "8px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Add Connector
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px" }}>
      {connectors.map((conn) => (
        <div
          key={conn.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "6px",
            marginBottom: "4px",
          }}
        >
          <span style={{ fontSize: "18px" }}>
            {connectorIcons[conn.type] || "\u26AB"}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px" }}>{conn.name}</div>
            <div
              style={{
                fontSize: "11px",
                color: statusColor(conn.status),
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
                  backgroundColor: statusColor(conn.status),
                  display: "inline-block",
                }}
              />
              {statusLabel(conn.status)}
            </div>
          </div>
        </div>
      ))}

      <button
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          color: "#9ca3af",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "6px",
          padding: "8px",
          cursor: "pointer",
          fontSize: "12px",
          marginTop: "8px",
        }}
      >
        + Add Connector
      </button>
    </div>
  );
};
