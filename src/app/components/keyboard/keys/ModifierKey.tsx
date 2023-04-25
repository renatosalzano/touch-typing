import { FC, useEffect } from "react";
import { CommonKeyProps, KeyCap } from "./KeyCap";

export const ModifiersKey: FC<
  {
    modifierKey: string;
  } & CommonKeyProps
> = ({ modifierKey, ...keyProps }) => {
  return <KeyCap key={modifierKey} {...keyProps} currentKey={modifierKey} />;
};
