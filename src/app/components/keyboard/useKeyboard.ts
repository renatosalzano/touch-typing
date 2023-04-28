import { useCallback, useEffect, useState } from "react";
import { keyboardStore } from "./keyboardStore";

export function isModifierKey(code: string) {
  return /(Control|Meta|Shift|Alt|Caps|Enter|Backspace|Space|Option|Tab)/i.test(
    code
  );
}

export const useKeyboard = () => {
  const { handleKey } = keyboardStore.useActions();

  const handleKeydown = useCallback((event: KeyboardEvent) => {
    handleKey(event, true);
  }, []);

  const handleKeyup = useCallback((event: KeyboardEvent) => {
    handleKey(event, false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    };
  }, [handleKeydown, handleKeyup]);
  /* return { currentKeypressed, modifiersKeyPressed }; */
};
