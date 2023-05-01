import { ChangeEvent } from "react";
import { createStore } from "./react-store/react-store";

export const typingStore = createStore({
  data: {
    isTyping: false,
    currentWords:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec risus ac tortor placerat vulputate eu eu elit.",
    inputValue: "",
    invalidIndex: [] as number[],
    index: 0,
  },
  actions: {
    setTyping(bool: boolean) {
      this.isTyping = bool;
    },
    initWords(words: string) {
      this.currentWords = words;
    },
    setInputValue(event: ChangeEvent<HTMLInputElement>) {
      const value = event.target.value;
      if (value === this.currentWords[this.index]) {
        // CORRECT
        ++this.index;
        this.inputValue += value;
      } else {
        if (!this.invalidIndex.includes(this.index + 1)) {
          this.invalidIndex.push(this.index + 1);
        }
        event.preventDefault();
      }
    },
  },
  getters: {
    getWords() {
      const words = this.currentWords.split(" ");
      return words;
    },
  },
});
