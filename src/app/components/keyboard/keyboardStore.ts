import { Key } from "../../classes/Key";
import { layouts } from "../../keyboard-layouts/layouts";
import { createStore } from "../../store/react-store/react-store";

type KeyPressed = { [key: string]: boolean };

interface ModifierKeyPressed {
  Alt: boolean;
  Shift: boolean;
  Control: boolean;
  CapsLock: boolean;
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

export function isModifierKey(code: string) {
  return /(Control|Meta|Shift|Alt|Caps|Enter|Backspace|Space|Option|Tab)/i.test(
    code
  );
}

export const keyboardStore = createStore({
  store: {
    currentKeyboard: "ANSI - United States QWERTY",
    standard: "ANSI" as keyof typeof layouts,
    layout: layouts.ANSI["United States QWERTY"],
    keyboardKeys: setKeyboardKeys(layouts.ANSI["United States QWERTY"], "ANSI"),
    showKeyboardSettings: false,
    fingerPlacement: false,
    keyPressed: {} as KeyPressed,
    modifierKeyPressed: {
      Alt: false,
      Shift: false,
      Control: false,
      CapsLock: false,
    },
  },
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

    handleKey(event: KeyboardEvent, keydown: boolean) {
      if (event.code === "CapsLock" || event.key === "CapsLock") {
        if (!keydown) return;
        const capsLockIsActive = event.getModifierState("CapsLock");
        this.modifierKeyPressed = {
          ...this.modifierKeyPressed,
          CapsLock: capsLockIsActive,
        };
        return;
      }
      const code = isModifierKey(event.code) ? event.code : event.key;
      if (this.keyPressed[code] === keydown) return;
      this.keyPressed = { ...this.keyPressed, [code]: keydown };
      if (isModifierKey(event.code)) {
        this.modifierKeyPressed = {
          ...this.modifierKeyPressed,
          [event.key]: keydown,
        };
      }
    },
  },
  getters: {
    getKeyboardKeys() {
      return this.keyboardKeys;
    },
  },
});
