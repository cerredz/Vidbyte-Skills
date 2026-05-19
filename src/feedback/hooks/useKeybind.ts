"use client";

import { useRef, useEffect, useMemo } from "react";
import { useKeybindContext } from "../context/KeybindContext";

interface UseKeybindOptions {
  description: string;
  enabled?: boolean;
  scope?: "global" | "local";
}

interface UseKeybindResult {
  id: string;
  bindings: string;
}

let idCounter = 0;

export function useKeybind(
  keys: string,
  action: () => void,
  options: UseKeybindOptions,
): UseKeybindResult {
  const { registerKeybind, unregisterKeybind } = useKeybindContext();
  const idRef = useRef<string>("");
  const actionRef = useRef(action);

  actionRef.current = action;

  if (!idRef.current) {
    idCounter += 1;
    idRef.current = `keybind-${idCounter}`;
  }

  const wrappedAction = useMemo(() => {
    return () => actionRef.current();
  }, []);

  useEffect(() => {
    registerKeybind(
      idRef.current,
      keys,
      wrappedAction,
      options.description,
      options.scope ?? "local",
    );
    return () => {
      unregisterKeybind(idRef.current);
    };
  }, [keys, wrappedAction, options.description, options.scope, registerKeybind, unregisterKeybind]);

  useEffect(() => {
    if (options.enabled === false) return;
  }, [options.enabled]);

  return { id: idRef.current, bindings: keys };
}
