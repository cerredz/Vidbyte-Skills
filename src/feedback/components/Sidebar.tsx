"use client";

import React from "react";
import type { SidebarTab } from "../../types";
import { useFeedbackContext } from "../context/FeedbackContext";
import { useKeybind } from "../hooks/useKeybind";
import { KeybindBadge } from "./ui/KeybindBadge";
import { CollectionsPanel } from "./CollectionsPanel";
import { ConnectorsPanel } from "./ConnectorsPanel";
import { HarnessPanel } from "./HarnessPanel";

const tabs: { id: SidebarTab; label: string; icon: string }[] = [
  { id: "collections", label: "Collections", icon: "\u{1F4C1}" },
  { id: "connectors", label: "Connectors", icon: "\u{1F517}" },
  { id: "harness", label: "Harness", icon: "\u{1F4AC}" },
];

export const Sidebar: React.FC = () => {
  const { state, toggleSidebar, setSidebarTab } = useFeedbackContext();

  const toggleBind = useKeybind("[", toggleSidebar, {
    description: "Toggle sidebar",
    scope: "global",
  });

  if (!state.sidebarOpen) {
    return (
      <div
        style={{
          width: "36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "12px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <KeybindBadge keybindId={toggleBind.id}>
          <button
            onClick={toggleSidebar}
            style={{
              background: "transparent",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              fontSize: "16px",
              padding: "4px",
            }}
            title="Expand sidebar"
          >
            \u25B6
          </button>
        </KeybindBadge>
      </div>
    );
  }

  return (
    <div
      className="sidebar"
      style={{
        width: "280px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        height: "100%",
        flexShrink: 0,
        transition: "width 250ms ease",
        overflow: "hidden",
        background: "rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", gap: "2px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              style={{
                background:
                  state.activeSidebarTab === tab.id
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
                border: "none",
                color:
                  state.activeSidebarTab === tab.id ? "#e0e0e0" : "#6b7280",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              title={tab.label}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        <KeybindBadge keybindId={toggleBind.id}>
          <button
            onClick={toggleSidebar}
            style={{
              background: "transparent",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              fontSize: "14px",
              padding: "4px",
            }}
            title="Collapse sidebar"
          >
            \u25C0
          </button>
        </KeybindBadge>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {state.activeSidebarTab === "collections" && <CollectionsPanel />}
        {state.activeSidebarTab === "connectors" && <ConnectorsPanel />}
        {state.activeSidebarTab === "harness" && <HarnessPanel />}
      </div>
    </div>
  );
};
