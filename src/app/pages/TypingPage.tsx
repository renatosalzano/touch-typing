import { FC, useState } from "react";
import KeyboardSection from "../components/keyboard/KeyboardSection";
import { TypingArea } from "../components/typing-area/TypingArea";
import { typingStore } from "../store/typingStore";

export const TypingPage: FC = () => {
  return (
    <typingStore.Provider>
      <div className="content">
        TypingPage
        <div className="typing-container">
          <TypingArea />
          <KeyboardSection />
        </div>
      </div>
    </typingStore.Provider>
  );
};
