import {
  FC,
  Fragment,
  MouseEvent,
  useMemo,
  ButtonHTMLAttributes,
  ReactElement,
} from "react";
import { useClassName } from "../../hooks/useClassName";

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: ReactElement | string;
  title?: string;
  submit?: boolean;
  render?: boolean;
  children?: any;
  className?: string;
  preventDefault?: boolean;
  onClick?(event: MouseEvent<HTMLButtonElement>): void;
}

export const Button: FC<IButton> = ({
  label,
  title,
  submit,
  render = true,
  className = "button",
  preventDefault = false,
  children,
  onClick,
  ...props
}) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (preventDefault) event.preventDefault();
    if (onClick) onClick(event);
  };

  const buttonClass = useClassName(className, { disabled: props.disabled });

  const buttonTitle = useMemo(() => {
    if (!render) return "";
    if (title) return title;
    if (typeof label === "string") return label;
    if (typeof children === "string") return children;
  }, [children, label, render, title]);

  const buttonLabel = useMemo(() => children || label, [children, label]);

  if (!render) return <Fragment />;
  if (submit) {
    return (
      <button {...props} type="submit" title={buttonTitle} {...buttonClass}>
        {buttonLabel}
      </button>
    );
  }
  return (
    <button
      {...props}
      {...buttonClass}
      type="button"
      title={buttonTitle}
      onClick={handleClick}
    >
      {buttonLabel}
    </button>
  );
};
