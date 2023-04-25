import { useMemo } from "react";

export const useClassName = (
  className: string,
  conditions: { [key: string]: boolean | string | null | undefined }
) => {
  const classBinding = useMemo(() => {
    let outputClassName = className;
    Object.keys(conditions).forEach((classKey) => {
      if (!!conditions[classKey]) {
        outputClassName += ` ${classKey}`;
      }
    });
    return outputClassName;
  }, [conditions]);

  return { className: classBinding };
};
