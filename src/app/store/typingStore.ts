import { useEffect } from "react";
import { Key } from "../classes/Key";
import { layouts } from "../keyboard-layouts/layouts";
import { createStore, useActions, useGetters } from "./core/react-store";

export interface TypingStore {
  data: {
    currentKeyboard: string,
    standard: "ISO" | 'ANSI',
    layout: any[],
    keyboardKeys: { Key: Key, size: number }[][],
    fingerPosition: boolean;
  },
  actions: {
    setKeyboardLayout(): void;
    setKeyboardKeys(keyboardKeys: any): { Key: Key, size: number }[][]
  },
  getters: {
    getLayout(): any[]
  }
}

export const typingStore = createStore({
  data: {
    currentKeyboard: 'ANSI - United States QWERTY',
    standard: 'ANSI',
    layout: layouts.ANSI['United States QWERTY'],
    keyboardKeys: [],
  },
  actions: {
    setKeyboardLayout(layout: string) {
      const [standard, lang] = layout.split(' - ');
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
          this.keyboardKeys[rowIndex].push(key);
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
})

export const useTypingAction = (): TypingStore['actions'] => {
  const actions = useActions(typingStore);
  return actions as TypingStore['actions']
}

type TGetters = (keyof TypingStore['getters'] | keyof TypingStore['data'])[]

export const useTypingGetters = (getters: TGetters) => {
  const _getters = useGetters(typingStore, getters);
  return [..._getters]
}