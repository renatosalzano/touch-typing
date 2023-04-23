import { FC, HTMLProps, ReactElement, useMemo, useRef, useState } from "react";
import "./input-style.scss";
import { useOutsideClick } from "../../hooks/useOutsideClick";

type TSelectChangeProps =
  | {
      name?: never;
      onChange(newValue: any): void;
    }
  | {
      name: string;
      onChange(name: string, newValue: any): void;
    };

interface IProps {
  name?: string;
  defaultValue: any;
  options: any[];
  setOptions?(option: { label: string; value: any }): {
    label: string;
    value: any;
  };
}

type options = {
  label: string;
  value: any;
}[];

export const Select: FC<IProps & TSelectChangeProps> = ({
  name,
  defaultValue = undefined,
  options = [],
  onChange,
  setOptions = (option) => ({ label: `${option}`, value: option }),
}) => {
  const [{ openList, currentValue }, setState] = useState({
    currentValue: defaultValue,
    openList: false,
  });

  const toggleList = () => {
    setState((prev) => ({ ...prev, openList: !prev.openList }));
  };

  const closeList = () => {
    setState((prev) => ({ ...prev, openList: false }));
  };

  const onSelect = (value: any) => {
    setState((prev) => {
      if (value !== currentValue) {
        return { openList: false, currentValue: value };
      }
      return prev;
    });
    if (name !== undefined) {
      onChange(name, value);
    } else {
      onChange(value);
    }
  };

  const optionsList = useMemo(() => {
    const output: { label: string; value: any }[] = [];
    options.forEach((option) => {
      output.push(setOptions(option));
    });
    return output;
  }, [options]);

  return (
    <div className="select-container">
      <input
        className="select-input"
        type="text"
        value={currentValue}
        onClick={toggleList}
        readOnly={true}
      />
      <div className="list-container">
        {openList && (
          <OptionList
            list={optionsList}
            onSelect={onSelect}
            closeList={closeList}
          />
        )}
      </div>
    </div>
  );
};

const OptionList: FC<{
  list: options;
  onSelect(value: any): void;
  closeList(): void;
}> = ({ list, onSelect, closeList }) => {
  const listRef = useOutsideClick<HTMLUListElement>(closeList);

  return (
    <ul ref={listRef} role="menu" className="options">
      {list.map(({ label, value }, index) => {
        return (
          <Option key={`${label}-${index}`} value={value} onSelect={onSelect}>
            {label}
          </Option>
        );
      })}
    </ul>
  );
};

const Option: FC<{
  value: any;
  children: string | ReactElement;
  onSelect(value: any): void;
}> = ({ value, children, onSelect }) => {
  return (
    <li className="option" onClick={() => onSelect(value)}>
      {children}
    </li>
  );
};
