"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { KeybindRegistration } from "../types";

interface KeybindContextValue {
  showKeybinds: boolean;
  setShowKeybinds: (show: boolean) => void;
  registerKeybind: (
    id: string,
    keys: string,
    action: () => void,
    description: string,
    scope?: "global" | "local",
  ) => void;
  unregisterKeybind: (id: string) => void;
  getKeybind: (id: string) => KeybindRegistration | undefined;
}

const KeybindContext = createContext<KeybindContextValue | null>(null);

export function useKeybindContext(): KeybindContextValue {
  const ctx = useContext(KeybindContext);
  if (!ctx) {
    throw new Error("useKeybindContext must be used within a KeybindProvider");
  }
  return ctx;
}

interface KeybindProviderProps {
  children: ReactNode;
  defaultShowKeybinds?: boolean;
}

export function KeybindProvider({
  children,
  defaultShowKeybinds = true,
}: KeybindProviderProps): React.ReactElement {
  const [showKeybinds, setShowKeybinds] = useState(defaultShowKeybinds);
  const registrationsRef = useRef<Map<string, KeybindRegistration>>(new Map());

  const registerKeybind = useCallback(
    (
      id: string,
      keys: string,
      action: () => void,
      description: string,
      scope: "global" | "local" = "local",
    ) => {
      registrationsRef.current.set(id, {
        id,
        keys,
        action,
        description,
        scope,
        enabled: true,
      });
    },
    [],
  );

  const unregisterKeybind = useCallback((id: string) => {
    registrationsRef.current.delete(id);
  }, []);

  const getKeybind = useCallback(
    (id: string): KeybindRegistration | undefined => {
      return registrationsRef.current.get(id);
    },
    [],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.tagName === "SELECT";

      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      const parts: string[] = [];
      if (ctrl) parts.push("Ctrl");
      if (shift) parts.push("Shift");
      if (alt) parts.push("Alt");
      parts.push(key.length === 1 ? key.toUpperCase() : key);

      const pressed = parts.join("+");

      for (const reg of registrationsRef.current.values()) {
        if (!reg.enabled) continue;

        const regHasModifier = reg.keys.includes("Ctrl") || reg.keys.includes("Shift") || reg.keys.includes("Alt");

        if (isInputFocused && !regHasModifier && reg.scope === "global") {
          continue;
        }

        const normPressed = pressed.replace(/Arrow/g, "").toLowerCase();
        const normRegistered = reg.keys.replace(/Arrow/g, "").toLowerCase();

        if (normPressed === normRegistered) {
          e.preventDefault();
          reg.action();
          return;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <KeybindContext.Provider
      value={{
        showKeybinds,
        setShowKeybinds,
        registerKeybind,
        unregisterKeybind,
        getKeybind,
      }}
    >
      {children}
    </KeybindContext.Provider>
  );
}
