import { FC } from "react";

export const TypingArea: FC<{
  onStartTyping(): void;
  onStopTyping(): void;
}> = ({
  onStartTyping,
  onStopTyping
}) => {


    return (
      <div className="typing-area-container">
        <input type="text" className="input-typing" onFocus={onStartTyping} onBlur={onStopTyping} />
        <div className="word-wrapper">

        </div>

      </div>
    )
  }