import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { useWindowResize } from "../../hooks/useWindowResize";
import { CommonKey } from "./keys/CommonKey";
import { EnterKey } from "./keys/EnterKey";
import { FnKey } from "./keys/FnKey";
import { isSpecialKey, keyboardStore } from "./keyboardStore";
import "./keyboard.scss";
import { Char } from "../../classes/Char";
import { ModifiersKey } from "./keys/ModifierKey";
import { useKeyboard } from "./useKeyboard";

export const Keyboard: FC = () => {
  const keyboardRef = useRef<HTMLDivElement>(null);

  const { standard, getKeyboardKeys, fingerPlacement } =
    keyboardStore.useGetters([
      "standard",
      "getKeyboardKeys",
      "fingerPlacement",
    ]);

  const { currentKeypressed, modifiersKeyPressed } = useKeyboard();

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
      {standard}
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
                fingerPlacement={fingerPlacement}
                currentKeypressed={currentKeypressed}
                modifiersKeyPressed={modifiersKeyPressed}
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
  currentKeypressed: { [key: string]: boolean };
  modifiersKeyPressed: { [key: string]: boolean };
  fingerPlacement: boolean;
  isoLayout: boolean;
}> = ({ _key, ...props }) => {
  const isAlphabetKey = useMemo(() => {
    return /[A-Z]/i.test(_key) && !isSpecialKey(_key);
  }, [_key]);

  const isCharKey = useMemo(() => {
    return !isSpecialKey(_key);
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
