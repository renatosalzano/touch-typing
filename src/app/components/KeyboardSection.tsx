import { FC, useState } from "react";
import { Keyboard } from "./keyboard/Keyboard";
import { KeyboardSettings } from "./keyboard/KeyboardSettings";
import { keyboardStore } from "./keyboard/keyboardStore";

export const KeyboardSection: FC<{
  isTyping: boolean;
}> = ({ isTyping }) => {
  return (
    <keyboardStore.Provider>
      <div className="keyboard-area">
        <Keyboard />
        <KeyboardSettings />
      </div>
    </keyboardStore.Provider>
  );
};

export default KeyboardSection;
