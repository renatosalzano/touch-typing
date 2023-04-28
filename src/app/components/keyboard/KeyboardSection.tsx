import { FC, useState } from "react";
import { Keyboard } from "./Keyboard";
import { KeyboardSettings } from "./KeyboardSettings";
import { keyboardStore } from "./keyboardStore";
import "./KeyboardSection.scss";

export const KeyboardSection: FC = () => {
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
