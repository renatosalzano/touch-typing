import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowResize } from "../../hooks/useWindowResize";
import { CommonKey } from "./keys/CommonKey";
import { EnterKey } from "./keys/EnterKey";
import { FnKey } from "./keys/FnKey";
import { isModifierKey, keyboardStore } from "./keyboardStore";
import { Char } from "../../classes/Char";
import { ModifiersKey } from "./keys/ModifierKey";
import { useKeyboard } from "./useKeyboard";
import "./keyboard.scss";

export const Keyboard: FC = () => {
  const keyboardRef = useRef<HTMLDivElement>(null);

  const { standard, getKeyboardKeys } = keyboardStore.useGetters([
    "standard",
    "getKeyboardKeys",
  ]);


  useKeyboard();

  useWindowResize(() => {
    const node = keyboardRef.current;
    if (node) {
      const caseSize = node.offsetWidth * 0.0133;
      node.style.setProperty("--case-size", caseSize + "px");
      node.style.setProperty(
        "--keycap-size",
        (node.offsetWidth - caseSize - 1) / 15 + "px"
      );
    }
  });

  return (
    <div ref={keyboardRef} className={`keyboard-container ${standard}`}>
      {getKeyboardKeys.map((row, index: number) => (
        <div className="row" key={`row-${index}`}>
          {row.map(({ Key, size }, i) => {
            return (
              <KeyboardKey
                key={`key-${Key.key}-${i}`}
                _key={Key.key}
                char={Key}
                size={size}
                rowIndex={index}
                isEnter={Key.key === "Enter"}
                isoLayout={standard === "ISO"}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};



const KeyboardKey: FC<{
  _key: string;
  char: Char;
  size?: number;
  isEnter?: boolean;
  rowIndex: number;
  isoLayout: boolean;
}> = ({ _key, ...props }) => {
  const isAlphabetKey = useMemo(() => {
    return /[A-Z]/i.test(_key) && !isModifierKey(_key);
  }, [_key]);

  const isCharKey = useMemo(() => {
    return !isModifierKey(_key);
  }, [_key]);

  switch (_key) {
    case "Enter":
      return <EnterKey {...props} />;
    case "Option":
      return <FnKey {...props} />;
    case "Tab":
    case "CapsLock":
    case "ShiftLeft":
    case "ShiftRight":
    case "ControlLeft":
    case "MetaLeft":
    case "AltLeft":
    case "Space":
    case "AltRight":
    case "MetaRight":
    case "ControlRight":
    case "Backspace":
      return <ModifiersKey {...props} modifierKey={_key} />;
    default:
      return (
        <CommonKey
          {...props}
          isAlphabetKey={isAlphabetKey}
          isCharKey={isCharKey}
        />
      );
  }
};
