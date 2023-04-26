import { FC, ReactNode, useMemo } from "react";
import { useClassName } from "../../../hooks/useClassName";
import { Char } from "../../../classes/Char";
import { keyboardStore } from "../keyboardStore";
import { KeyCap, CommonKeyProps } from "./KeyCap";

export const CommonKey: FC<
  {
    char: Char;
    isAlphabetKey: boolean;
    isCharKey: boolean;
  } & CommonKeyProps
> = ({ isAlphabetKey, isCharKey, ...keyCapsProps }) => {
  const { modifierKeyPressed } = keyboardStore.useGetters([
    "modifierKeyPressed",
  ]);
  const { Shift, Alt, Control, CapsLock } = modifierKeyPressed;
  const {
    key = "",
    shiftKey = "",
    ctrlAltKey = "",
    shiftCtrlAltKey = "",
  } = keyCapsProps.char;

  const renderKey = useMemo(() => {
    switch (true) {
      case Shift && Alt && Control:
        return shiftCtrlAltKey;
      case Alt && Control:
        return ctrlAltKey;
      case Shift:
        return shiftKey;
      case CapsLock:
        if (isAlphabetKey) {
          return shiftKey;
        }
        return key;
      case isCharKey:
        return key;
      default:
        return "";
    }
  }, [
    shiftCtrlAltKey,
    ctrlAltKey,
    shiftKey,
    isCharKey,
    isAlphabetKey,
    key,
    modifierKeyPressed,
  ]);

  return (
    <KeyCap {...keyCapsProps} currentKey={renderKey}>
      {renderKey}
    </KeyCap>
  );
};
