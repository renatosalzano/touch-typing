import { FC, ReactNode, useEffect, useMemo, useRef } from "react";
import { useClassName } from "../../../hooks/useClassName";
import { Char } from "../../../classes/Char";

interface KeyCapProps {
  char: Char;
  isEnter?: boolean;
  isoLayout?: boolean;
  size?: number;
  rowIndex: number;
  currentKey: string;
  currentKeypressed: { [key: string]: boolean };
  fingerPlacement: boolean;
  forcePressed?: boolean;
  children?: ReactNode;
}

export type CommonKeyProps = Omit<
  KeyCapProps,
  "currentKey" | "children" | "forcePressed"
>;

export const KeyCap: FC<KeyCapProps> = ({
  char,
  size = 1,
  isEnter = false,
  isoLayout = false,
  currentKey,
  currentKeypressed,
  fingerPlacement,
  forcePressed = false,
  rowIndex,
  children,
}) => {
  const keyCapRef = useRef<HTMLDivElement>(null);
  const keyCapsClassNameCondition = useMemo(() => {
    if (char.finger) return { [char.finger]: char.finger && fingerPlacement };
    return {};
  }, [char.finger, fingerPlacement]);

  useEffect(() => {
    if (keyCapRef.current) {
      keyCapRef.current.style.setProperty("--key-size", `${size}`);
    }
  }, [size]);

  const keyCapClass = useClassName(`keycap-container`, {
    hidden: isEnter && isoLayout && rowIndex === 2,
    pressed: currentKeypressed[currentKey] || forcePressed,
    "iso-enter": isEnter && isoLayout,
    "caps-lock-on": false,
  });

  const keyClass = useClassName("keycap", keyCapsClassNameCondition);

  return (
    <div ref={keyCapRef} {...keyCapClass}>
      <div {...keyClass}>{children}</div>
    </div>
  );
};
