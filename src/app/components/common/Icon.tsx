import { FC, useMemo } from "react";
import { useClassName } from "../../hooks/useClassName";

const icons = {
  settings: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="512"
      height="512"
      viewBox="0 0 512 512"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
        d="M262.29 192.31a64 64 0 1 0 57.4 57.4a64.13 64.13 0 0 0-57.4-57.4ZM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22a155.3 155.3 0 0 1-21.46-12.57a16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22a155.3 155.3 0 0 1 21.46 12.57a16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47Z"
      />
    </svg>
  ),
  "arrow-up": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path fill="currentColor" d="m7 14l5-5l5 5H7Z" />
    </svg>
  ),
  keyboard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M3 21q-.825 0-1.413-.588T1 19V6q0-.825.588-1.413T3 4h18q.825 0 1.413.588T23 6v13q0 .825-.588 1.413T21 21H3Zm5-4h8v-1H8v1Zm-3-3h2v-2H5v2Zm4 0h2v-2H9v2Zm4 0h2v-2h-2v2Zm4 0h2v-2h-2v2ZM5 10h2V8H5v2Zm4 0h2V8H9v2Zm4 0h2V8h-2v2Zm4 0h2V8h-2v2Z"
      />
    </svg>
  ),
  touch: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <path
        fill="currentColor"
        d="M16 12a3.003 3.003 0 0 0-3 3v3h6v-3a3.003 3.003 0 0 0-3-3Z"
      />
      <path
        fill="currentColor"
        d="M16 6a9.01 9.01 0 0 0-9 9v13h18V15a9.01 9.01 0 0 0-9-9Zm5 14H11v-5a5 5 0 0 1 10 0Z"
      />
      <path
        fill="currentColor"
        d="M29 15h-2a11 11 0 0 0-22 0H3a13 13 0 0 1 26 0Z"
      />
    </svg>
  ),
} as const;

type iconsKeys = keyof typeof icons;

export const Icon: FC<{
  icon: iconsKeys;
  className?: string;
}> = ({ icon, className }) => {
  const classCondition = className ? { [className]: className } : {};
  return <div {...useClassName("icon", classCondition)}>{icons[icon]}</div>;
};
