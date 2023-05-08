import { FC, useMemo, useState } from "react";
import { Select } from "../input/Select";
import { Icon } from "../common/Icon";
import { Button } from "../input/Button";
import "./KeyboardSettings.scss";
import { getLayouts } from "../../keyboard-layouts/layouts";
import { ToggleButtons } from "../input/ToggleButtons";
import { keyboardStore } from "./keyboardStore";

export const KeyboardSettings: FC = () => {
  const { setKeyboardLayout, setFingerPlacement } = keyboardStore.useActions();
  const { currentKeyboard, showKeyboardSettings } = keyboardStore.useGetters([
    "currentKeyboard",
    "showKeyboardSettings",
  ]);
  const [settings, setSettings] = useState(false);

  const onChange = (name: string, newValue: string) => {
    setKeyboardLayout(newValue);
  };

  const toggleSettings = () => {
    setSettings((prev) => !prev);
  };

  return (
    <div className="keyboard-settings">
      {/* <Button className="settings-button" onClick={toggleSettings}>
        <Icon icon="settings" />
      </Button> */}
      {showKeyboardSettings && (
        <div className="settings">
          <span>
            <Icon icon="keyboard" />
            Layout
          </span>
          <Select
            name="currentLayout"
            options={getLayouts()}
            defaultValue={currentKeyboard}
            onChange={onChange}
          />
          <span>
            <Icon icon="touch" />
            Touch Typing Finger Placement
          </span>
          <ToggleButtons onToggle={setFingerPlacement} />
        </div>
      )}
    </div>
  );
};

/* const TestWatchers = () => {

  const { fingerPlacement } = keyboardStore.useGetters([
    "fingerPlacement",
  ]);

  keyboardStore.useWatch(
    {
      keyPressed() {
        console.log(fingerPlacement)
      },
    },
    []
  );

  return <div>TEST</div>

} */