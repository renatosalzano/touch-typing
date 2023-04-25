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
    modifiersKeyPressed: { [key: string]: boolean };
  } & CommonKeyProps
> = ({ isAlphabetKey, isCharKey, modifiersKeyPressed, ...keyCapsProps }) => {
  const { Shift, Alt, Control, CapsLock } = modifiersKeyPressed;
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
    modifiersKeyPressed,
    shiftCtrlAltKey,
    ctrlAltKey,
    shiftKey,
    isCharKey,
    isAlphabetKey,
    key,
  ]);

  return (
    <KeyCap {...keyCapsProps} currentKey={renderKey}>
      {renderKey}
    </KeyCap>
  );
};
