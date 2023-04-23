import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useRef,
  MutableRefObject,
  useState,
} from "react";
import { constant } from "../utils/constant";

function isModifierKey(code: string) {
  return /(Control|Meta|Shift|Alt|Caps|Enter|Backspace|Space|Option|Tab)/i.test(
    code
  );
}

export class Char {
  key: string;
  shiftKey?: string;
  ctrlAltKey?: string;
  shiftCtrlAltKey?: string;
  finger?: "thumb" | "index" | "middle" | "ring" | "pinky";
  hand?: "L" | "R";
  correctShiftKey?: "L" | "R";
  constructor(
    chars: string,
    rowIndex: number,
    charIndex: number,
    standard: string
  ) {
    if (isModifierKey(chars)) {
      this.key = chars;
    } else {
      this.key = chars[0];
      this.shiftKey = chars[1];
      this.ctrlAltKey = chars?.[2];
      this.shiftCtrlAltKey = chars?.[3];
    }

    switch (rowIndex) {
      case 0:
        if (charIndex <= 6) {
          this.hand = "L";
        } else {
          this.hand = "R";
        }
        break;
      case 1:
      case 2:
      case 3:
        if (charIndex <= 5) {
          this.hand = "L";
        } else {
          this.hand = "R";
        }
        break;
    }

    const isoOffset = standard === "iso" && rowIndex === 3 ? 1 : 0;

    switch (true) {
      case rowIndex === 4 && charIndex >= 2 && charIndex <= 4:
        this.finger = "thumb";
        break;
      case rowIndex === 4 && charIndex > 4:
      case standard === "iso" && rowIndex === 3 && charIndex <= 2:
      case charIndex <= 1 + isoOffset:
      case charIndex >= 10 + isoOffset:
        this.finger = "pinky";
        break;
      case charIndex === 2 + isoOffset:
      case charIndex === 9 + isoOffset:
        this.finger = "ring";
        break;
      case charIndex === 3 + isoOffset:
      case charIndex === 8 + isoOffset:
        this.finger = "middle";
        break;
      case charIndex >= 4 + isoOffset && charIndex <= 5 + isoOffset:
      case charIndex >= 6 + isoOffset && charIndex <= 7 + isoOffset:
        this.finger = "index";
        break;
      case rowIndex === 4:
        this.finger = "thumb";
        break;
    }
  }
}

interface ITypingContext {
  store: MutableRefObject<any>;
  getters: {};
  actions: {
    setChars(
      keyboardKeys: { k: string }[][],
      standard: string
    ): { char: Char; size?: number }[][];
    resetChars(): void;
  };
}

const TypingContext = createContext<ITypingContext>({} as ITypingContext);

export const TypingProvider: FC<{
  children: ReactNode | ReactNode[];
}> = ({ children }) => {
  const typingData = useRef<{
    chars: any[];
    symbols: string[];
  }>({
    chars: [],
    symbols: constant.symbols,
  });

  const value = useMemo(
    () => ({
      store: typingData,
      getters: {
        getKeys() {
          return typingData.current.chars;
        },
      },
      actions: {
        setChars(
          keyboardKeys: { k: string; size?: number }[][],
          standard: string
        ) {
          const output = [] as { char: Char; size?: number }[][];
          typingData.current.chars = [];
          keyboardKeys.forEach((row, rowIndex) => {
            typingData.current.chars.push([] as any[]);
            output.push([] as any[]);
            row.forEach(({ k, size }, index) => {
              const char = new Char(k, rowIndex, index, standard);
              typingData.current.chars[rowIndex].push(char);
              output[rowIndex].push({ char, size });
            });
          });
          console.log(output)
          return output;
        },
        resetChars() {
          typingData.current.chars = [];
        },
      },
    }),
    []
  );

  return (
    <TypingContext.Provider value={value}>{children}</TypingContext.Provider>
  );
};

export const useTypingContext = () => useContext(TypingContext)
