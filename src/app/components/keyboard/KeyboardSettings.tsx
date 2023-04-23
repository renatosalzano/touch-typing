import { FC } from "react";
import { typingStore } from "../../store/typingStore";
import { Select } from "../input/Select";

export const KeyboardSettings: FC<any> = ({ layouts, setKeyboardSettings }) => {
  const { setKeyboardLayout } = typingStore.useActions();
  const { currentKeyboard } = typingStore.useGetters(["currentKeyboard"]);
  const onToggleFingerPosition = () => {
    setKeyboardSettings((prev: any) => ({
      ...prev,
      fingerPosition: !prev.fingerPosition,
    }));
  };
  const onChange = (name: string, newValue: string) => {
    setKeyboardSettings((prev: any) => ({ ...prev, [name]: newValue }));
    setKeyboardLayout(newValue);
  };
  return (
    <div className="keyboard-settings">
      <Select
        name="currentLayout"
        options={layouts}
        defaultValue={currentKeyboard}
        onChange={onChange}
      />

      <button onClick={onToggleFingerPosition}>Finger position</button>
    </div>
  );
};
