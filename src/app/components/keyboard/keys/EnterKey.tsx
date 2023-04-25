import { FC } from "react";
import { Char } from "../../../classes/Char";
import { CommonKeyProps, KeyCap } from "./KeyCap";

export const EnterKey: FC<
  {
    isoLayout: boolean;
  } & CommonKeyProps
> = ({ isoLayout, ...commonProps }) => {
  return (
    <KeyCap {...commonProps} currentKey="Enter" isoLayout={isoLayout} isEnter>
      {isoLayout && (
        <>
          <div className="iso-enter-top">
            <div className="enter-border" />
          </div>
          <div className="iso-enter-bottom" />
        </>
      )}
    </KeyCap>
  );
};
