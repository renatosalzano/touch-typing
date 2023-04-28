import { useEffect, useRef } from "react";

export const useOutsideClick = <T extends Node>(callback: () => void) => {
  const ref = useRef<T>(null);
  const _callback = useRef(callback);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        _callback.current();
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [ref]);

  return ref;
};
