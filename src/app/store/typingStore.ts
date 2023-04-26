import { useEffect } from "react";
import { Key } from "../classes/Key";
import { layouts } from "../keyboard-layouts/layouts";
import { createStore } from "./react-store/react-store";

export interface TypingStore {
  currentKeyboard: string;
  standard: "ISO" | "ANSI";
  layout: any[];
  keyboardKeys: { Key: Key; size?: number }[][];
  showKeyboardSettings: boolean;
  fingerPlacement: boolean;
}

function setKeyboardKeys(
  keyboardKeys: { k: string; size?: number }[][],
  standard: string
) {
  const output = [] as { Key: Key; size?: number }[][];
  keyboardKeys.forEach((row, rowIndex) => {
    output.push([] as any[]);
    row.forEach(({ k, size }, index) => {
      const key = new Key(k, rowIndex, index, standard);
      output[rowIndex].push({ Key: key, size });
    });
  });
  return output;
}

export const typingStore = createStore({
  store: {
    currentKeyboard: "ANSI - United States QWERTY",
    standard: "ANSI",
    layout: layouts.ANSI["United States QWERTY"],
    keyboardKeys: setKeyboardKeys(layouts.ANSI["United States QWERTY"], "ANSI"),
    showKeyboardSettings: false,
    fingerPlacement: false,
  } as TypingStore,
  actions: {
    setKeyboardLayout(layout: string) {
      const [standard, lang] = layout.split(" - ") as ["ISO", "ANSI", string];
      this.currentKeyboard = layout;
      this.standard = standard;
      this.layout = (layouts as any)[standard][lang];
      this.keyboardKeys = setKeyboardKeys(this.layout, this.standard);
    },
    setFingerPlacement(bool?: boolean) {
      if (bool !== undefined) this.fingerPlacement = bool;
      else this.fingerPlacement = !this.fingerPlacement;
    },
    setShowKeyboardSettings(bool?: boolean) {
      if (bool !== undefined) this.showKeyboardSettings = bool;
      else this.showKeyboardSettings = !this.showKeyboardSettings;
    },
  },
  getters: {
    getLayout() {
      return this.layout;
    },
  },
});
