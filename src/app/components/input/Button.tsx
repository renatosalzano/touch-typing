import { FC, ReactNode, useMemo } from "react";

export const Button: FC<{
  children: string | ReactNode
}> = ({ children }) => {

  const buttonClass = useMemo(() => {
    let baseClass = "app-button";
    return baseClass;
  }, [])

  return <button type="button" className={buttonClass}>{children}</button>
}