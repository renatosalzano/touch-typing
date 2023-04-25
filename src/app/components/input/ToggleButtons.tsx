import { FC, useState } from "react";
import { Button } from "./Button";
import { useClassName } from "../../hooks/useClassName";

export const ToggleButtons: FC<{
  def?: boolean;
  onToggle: (bool: boolean) => void;
}> = ({ onToggle, def = false }) => {
  const [active, setActive] = useState(def);
  const onClick = (bool: boolean) => {
    setActive(bool);
    onToggle(bool);
  };
  return (
    <div className="toggle-container">
      <Button
        {...useClassName("toggle-button", { active: !active })}
        onClick={() => onClick(false)}
      >
        off
      </Button>
      <Button
        {...useClassName("toggle-button", { active: active })}
        onClick={() => onClick(true)}
      >
        on
      </Button>
    </div>
  );
};
