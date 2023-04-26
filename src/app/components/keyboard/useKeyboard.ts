import { useCallback, useEffect, useState } from "react";
import { keyboardStore } from "./keyboardStore";

export function isModifierKey(code: string) {
  return /(Control|Meta|Shift|Alt|Caps|Enter|Backspace|Space|Option|Tab)/i.test(
    code
  );
}

export const useKeyboard = () => {
  /* const [currentKeypressed, setCurrentKey] = useState<{
    [key: string]: boolean;
  }>({});

  const [modifiersKeyPressed, setModifiersPressed] = useState({
    Alt: false,
    Shift: false,
    CapsLock: false,
    Control: false,
    Meta: false,
  });

  const handleKey = (event: KeyboardEvent, keydown: boolean) => {
    if (event.code === "CapsLock" || event.key === "CapsLock") {
      if (!keydown) return;
      const capsLockIsActive = event.getModifierState("CapsLock");
      setModifiersPressed((prev) => ({ ...prev, CapsLock: capsLockIsActive }));
      return;
    }
    const code = isModifierKey(event.code) ? event.code : event.key;
    setCurrentKey((prev) => ({ ...prev, [code]: keydown }));
    if (isModifierKey(event.code)) {
      setModifiersPressed((prev) => ({
        ...prev,
        [event.key]: keydown,
      }));
    }
  }; */
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
