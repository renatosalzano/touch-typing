import { ChangeEvent, FC, ReactNode, useMemo, useRef } from "react";
import { typingStore } from "../../store/typingStore";
import { Letter, Word } from "./word/Word";
import "./TypingArea.scss";
import { useClassName } from "../../hooks/useClassName";

const loremIpsum =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec risus ac tortor placerat vulputate eu eu elit.";

export const TypingArea: FC = () => {
  const { getWords, currentWords } = typingStore.useGetters([
    "getWords",
    "currentWords",
  ]);

  const words = useMemo(() => {
    const output: { letter: string; letterCount: number }[][] = [];
    let currentWord: { letter: string; letterCount: number }[] = [];
    currentWords.split("").forEach((letter, letterCount) => {
      if (letter === " ") {
        output.push(currentWord);
        output.push([{ letter: " ", letterCount }]);
        currentWord = [];
      } else {
        currentWord.push({ letter, letterCount: letterCount + 1 });
      }
    });
    return output;
  }, [currentWords]);

  return (
    <div className="typing-area-container">
      <InputTyping />
      <div className="word-wrapper">
        <Caret />
        {words.map((letters, wordIndex) => {
          if (letters[0].letter === " ") {
            return <span key={`spacer-${wordIndex}`} className="spacer" />;
          } else {
            return (
              <Word key={`word-${wordIndex}`}>
                {letters.map((letterProps, i) => (
                  <Letter key={`letter-${wordIndex}-${i}`} {...letterProps} />
                ))}
              </Word>
            );
          }
        })}
      </div>
    </div>
  );
};

const InputTyping: FC = () => {
  const { setInputValue } = typingStore.useActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValue = useRef("");

  return (
    <input
      ref={inputRef}
      type="text"
      className="input-typing"
      onChange={setInputValue}
      value={inputValue.current}
    />
  );
};

const Caret: FC = () => {
  const { inputValue } = typingStore.useGetters(["inputValue"]);
  console.log(inputValue);
  return (
    <div className="caret-container">
      {inputValue}
      <div {...useClassName("caret", {})} />
    </div>
  );
};
