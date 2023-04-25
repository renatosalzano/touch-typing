import { FC, useState } from "react";
import KeyboardSection from "../components/KeyboardSection";
import { TypingArea } from "../components/typing-area/TypingArea";

export const TypingPage: FC = () => {
  const [{ isTyping }, setState] = useState({
    isTyping: false,
  });

  const setTyping = (isTyping: boolean) => {
    setState((prev) => ({ ...prev, isTyping }));
  };

  return (
    <div className="content">
      TypingPage
      <div className="typing-container">
        <TypingArea
          onStartTyping={() => setTyping(true)}
          onStopTyping={() => setTyping(false)}
        />
        <KeyboardSection isTyping={isTyping} />
      </div>
    </div>
  );
};
