import { useEffect } from "react";
import { Key } from "../classes/Key";
import { layouts } from "../keyboard-layouts/layouts";
import { createStore } from "./core/react-store";

export interface TypingStore {
  currentKeyboard: string,
  standard: "ISO" | 'ANSI',
  layout: any[],
  keyboardKeys: { Key: Key, size?: number }[][],
  fingerPosition: boolean;
}

export const typingStore = createStore({
  store: {
    currentKeyboard: 'ANSI - United States QWERTY',
    standard: 'ANSI',
    layout: layouts.ANSI['United States QWERTY'],
    keyboardKeys: [],
    fingerPosition: false
  } as TypingStore,
  actions: {
    setKeyboardLayout(layout: string) {
      const [standard, lang] = layout.split(' - ') as ['ISO', 'ANSI', string];
      this.currentKeyboard = layout;
      this.standard = standard;
      this.layout = (layouts as any)[standard][lang]
    },
    setKeyboardKeys(
      keyboardKeys: { k: string; size?: number }[][]
    ) {
      const output = [] as { Key: Key; size?: number }[][];
      this.keyboardKeys = [];
      keyboardKeys.forEach((row, rowIndex) => {
        this.keyboardKeys.push([] as any[]);
        output.push([] as any[]);
        row.forEach(({ k, size }, index) => {
          const key = new Key(k, rowIndex, index, this.standard);
          this.keyboardKeys[rowIndex].push({ Key: key, size });
          output[rowIndex].push({ Key: key, size });
        });
      });
      return output;
    }
  },
  getters: {
    getLayout() {
      return this.layout;
    },

  }
});