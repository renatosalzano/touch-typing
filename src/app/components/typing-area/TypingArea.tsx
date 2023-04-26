import { FC } from "react";

const loremIpsum =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec risus ac tortor placerat vulputate eu eu elit.";

export const TypingArea: FC<{
  onStartTyping(): void;
  onStopTyping(): void;
}> = ({ onStartTyping, onStopTyping }) => {
  return (
    <div className="typing-area-container">
      <input
        type="text"
        className="input-typing"
        onFocus={onStartTyping}
        onBlur={onStopTyping}
      />
      <div className="word-wrapper"></div>
    </div>
  );
};
