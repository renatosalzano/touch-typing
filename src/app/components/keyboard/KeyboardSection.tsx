import { FC, useState } from "react";
import { Keyboard } from "./Keyboard";
import { KeyboardSettings } from "./KeyboardSettings";
import { keyboardStore } from "./keyboardStore";
import "./KeyboardSection.scss";

export const KeyboardSection: FC<{
  isTyping: boolean;
}> = ({ isTyping }) => {
  return (
    <keyboardStore.Provider>
      <div className="keyboard-section">
        <Keyboard />
        <KeyboardSettings />
      </div>
    </keyboardStore.Provider>
  );
};

export default KeyboardSection;
