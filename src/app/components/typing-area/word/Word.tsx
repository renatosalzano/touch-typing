import { FC, ReactNode, useState } from "react";
import { typingStore } from "../../../store/typingStore";
import { useClassName } from "../../../hooks/useClassName";

export const Word: FC<{
  children: ReactNode[];
}> = ({ children }) => {
  return <div className="word">{children}</div>;
};

export const Letter: FC<{
  letter: string;
  letterCount: number;
}> = ({ letter, letterCount }) => {
  const [{ correct, error }, setState] = useState({
    correct: false,
    error: false,
  });
  /* typingStore.useWatch({
    index(newIndex) {
      if (newIndex === letterCount) {
        setState((prev) => ({ ...prev, correct: true }));
      }
    },
    invalidIndex(arr) {
      console.log("watch-update");
      if (arr.includes(letterCount)) {
        setState((prev) => ({ ...prev, error: true }));
      }
    },
  }); */

  return <span {...useClassName("letter", { correct, error })}>{letter}</span>;
};
