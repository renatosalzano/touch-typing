import { FC } from "react";
import { CommonKeyProps, KeyCap } from "./KeyCap";
import { Button } from "../../input/Button";
import { Icon } from "../../common/Icon";
import { keyboardStore } from "../keyboardStore";
import { useClassName } from "../../../hooks/useClassName";

export const FnKey: FC<{} & CommonKeyProps> = ({ ...keyProps }) => {
  const { setShowKeyboardSettings } = keyboardStore.useActions();
  const { showKeyboardSettings } = keyboardStore.useGetters([
    "showKeyboardSettings",
  ]);
  return (
    <KeyCap
      {...keyProps}
      currentKey="Option"
      forcePressed={showKeyboardSettings}
    >
      <Button
        {...useClassName("settings-key", { active: showKeyboardSettings })}
        onClick={() => setShowKeyboardSettings(true)}
      >
        <Icon icon="settings" />
      </Button>
    </KeyCap>
  );
};
