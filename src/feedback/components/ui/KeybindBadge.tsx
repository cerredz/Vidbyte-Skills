"use client";

import React from "react";
import { useKeybindContext } from "../../context/KeybindContext";

interface KeybindBadgeProps {
  keybindId: string;
  children: React.ReactNode;
  className?: string;
}

function formatKey(keys: string): string {
  return keys
    .replace("ArrowUp", "\u2191")
    .replace("ArrowDown", "\u2193")
    .replace("ArrowLeft", "\u2190")
    .replace("ArrowRight", "\u2192")
    .replace("Escape", "Esc")
    .replace("Enter", "\u23CE")
    .replace("Ctrl", navigator.platform.includes("Mac") ? "\u2318" : "Ctrl")
    .replace("Shift", "\u21E7")
    .replace("Alt", navigator.platform.includes("Mac") ? "\u2325" : "Alt");
}

export const KeybindBadge: React.FC<KeybindBadgeProps> = ({
  keybindId,
  children,
  className = "",
}) => {
  const { showKeybinds, getKeybind } = useKeybindContext();
  const registration = getKeybind(keybindId);

  if (!showKeybinds || !registration) {
    return <>{children}</>;
  }

  return (
    <span className={`keybind-wrapper ${className}`} style={{ position: "relative", display: "inline-flex" }}>
      {children}
      <kbd
        className="keybind-badge"
        style={{
          position: "absolute",
          bottom: "1px",
          right: "1px",
          fontSize: "9px",
          fontFamily: "monospace",
          background: "rgba(0,0,0,0.75)",
          color: "#e0e0e0",
          padding: "0 3px",
          borderRadius: "3px",
          lineHeight: "1.4",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
        title={registration.description}
      >
        {formatKey(registration.keys)}
      </kbd>
    </span>
  );
};
