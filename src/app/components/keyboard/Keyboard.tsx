import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Key } from "../../classes/Key";
import { layouts } from "../../keyboard-layouts/layouts";
import { Char, useTypingContext } from "../../providers/TypingProvider";
import { useActions, useGetters } from "../../store/core/react-store";
import { typingStore, useTypingAction, useTypingGetters } from "../../store/typingStore";
import "./keyboard.scss";

function isChar(code: string) {
  return !/(Control|Meta|Shift|Alt|Caps|Enter|Backspace|Space|Option|Tab)/i.test(
    code
  );
}

export const Keyboard: FC<{
  layout: string;
  activeKeyboard: boolean;
  fingerPosition: boolean;
}> = ({ layout, activeKeyboard, fingerPosition }) => {
  const {
    actions: { setChars, resetChars },
  } = useTypingContext();

  const [keyPressed, setKeyPressed] = useState<{ [key: string]: boolean }>({});
  const [modifiersKey, setModifiersKeys] = useState({
    Alt: false,
    Shift: false,
    CapsLock: false,
    Control: false,
    Meta: false,
  });

  const handleKey = (event: KeyboardEvent, pressed: boolean) => {
    if (event.code === "CapsLock" || event.key === "CapsLock") {
      if (!pressed) return;
      const capsLockIsActive = event.getModifierState("CapsLock");
      setModifiersKeys((prev) => ({ ...prev, CapsLock: capsLockIsActive }));
      return;
    }

    const code = isChar(event.code) ? event.key : event.code;
    setKeyPressed((prev) => {
      if (pressed) {
        if (prev[code]) return prev;
        return { ...prev, [code]: pressed };
      }
      delete prev[code];
      return { ...prev };
    });
    if (!isChar(event.code)) {
      setModifiersKeys((prev) => ({
        ...prev,
        [event.key]: pressed,
      }));
    }
  };

  const handleKeydown = useCallback((event: KeyboardEvent) => {
    handleKey(event, true);
  }, []);

  const handleKeyup = useCallback((event: KeyboardEvent) => {
    handleKey(event, false);
  }, []);

  useEffect(() => {
    if (activeKeyboard) {
      window.addEventListener("keydown", handleKeydown);
      window.addEventListener("keyup", handleKeyup);
    } else {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    }
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    };
  }, [activeKeyboard, handleKeydown, handleKeyup]);

  /* const [standard, chars] = useMemo(() => {
    console.log("keyboard updated");
    const [standard, language] = layout.split(" - ");
    const keys = (layouts as any)[standard][language] as {
      k: string;
      size?: number;
    }[][];
    const chars = setChars(keys, standard);
    return [standard, chars];
  }, [layout, setChars]); */

  /*  const [standard, getLayout] = useTypingGetters(['standard', 'getLayout']); */

  const [standard, getLayout] = useGetters(typingStore, ['standard', 'getLayout']);

  const { setKeyboardKeys } = useTypingAction()

  const chars = useMemo(() => {
    return setKeyboardKeys(getLayout);
  }, [getLayout])

  useEffect(() => {
    console.log(standard)
  }, [standard])

  return (
    <div className={`keyboard-container ${standard}`}>
      {!activeKeyboard && (
        <div className="disabled-keyboard-overlay"> keyboard diasabled</div>
      )}
      {chars.map((row, index: number) => (
        <div className="row" key={`row-${index}`}>
          {row.map(({ Key, size }, i) => {
            return (
              <Keycap
                key={`key-${Key.key}-${i}`}
                char={Key}
                size={size}
                isEnter={Key.key === "Enter"}
                rowIndex={index}
                isoLayout={standard === "ISO"}
                isCapsLock={Key.key === "CapsLock"}
                isModifierKey={!isChar(Key.key)}
                modifiersKey={modifiersKey}
                currentKeyPressed={keyPressed}
                fingerPosition={fingerPosition}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Keycap: FC<{
  char: Char;
  size?: number;
  isEnter?: boolean,
  rowIndex: number;
  isoLayout: boolean;
  isCapsLock?: boolean;
  isModifierKey?: boolean;
  fingerPosition: boolean;
  modifiersKey: {
    Alt: boolean;
    Shift: boolean;
    CapsLock: boolean;
    Control: boolean;
    Meta: boolean;
  };
  currentKeyPressed: { [key: string]: boolean };
}> = ({
  char: {
    key = "",
    shiftKey = "",
    ctrlAltKey = "",
    shiftCtrlAltKey = "",
    finger = "",
  },
  size = 1,
  isEnter,
  rowIndex,
  isoLayout,
  isCapsLock,
  isModifierKey,
  fingerPosition,
  modifiersKey: { Alt, Shift, CapsLock, Control, Meta },
  currentKeyPressed,
}) => {
    const keyCapRef = useRef<HTMLDivElement>(null);

    const isAlphabetKey = useMemo(() => {
      return /[A-Z]/i.test(key) && isChar(key);
    }, [key]);

    useEffect(() => {
      if (keyCapRef.current) {
        keyCapRef.current.style.setProperty("--key-size", `${size}`);
      }
    }, [size]);

    const renderKey = useMemo(() => {
      switch (true) {
        case isModifierKey:
          return "";
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
        default:
          if (isChar(key)) {
            return key;
          }
          return "";
      }
    }, [isModifierKey, Shift, Alt, Control, shiftCtrlAltKey, ctrlAltKey, shiftKey, CapsLock, isAlphabetKey, key]);

    const isPressed = useMemo(() => {
      if (isChar(key)) {
        return currentKeyPressed[renderKey];
      }
      return currentKeyPressed[key];
    }, [currentKeyPressed, renderKey]);

    const keyClass = useMemo(() => {
      let base = "keycap-container";
      if (isEnter && isoLayout && rowIndex === 2) return base += ' hidden'
      if (isPressed) base += " pressed";
      if (isEnter && isoLayout) base += " iso-enter"
      if (isCapsLock && CapsLock) base += " caps-lock-on";
      return base;
    }, [isEnter, isoLayout, rowIndex, isPressed, isCapsLock, CapsLock]);

    const keycapsClass = useMemo(() => {
      let base = "keycap";
      if (finger && fingerPosition) base += ` ${finger}`;
      return base;
    }, [finger, fingerPosition]);



    return (
      <div ref={keyCapRef} className={`${keyClass} ${key}-${rowIndex} `}>
        <div className={keycapsClass}>
          {isoLayout && isEnter && (
            <>
              <div className="iso-enter-top">
                <div className="enter-border" />
              </div>
              <div className="iso-enter-bottom" />
            </>
          )}
          {renderKey}
        </div>
      </div>
    );
  };
