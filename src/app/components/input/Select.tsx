import {
  FC,
  HTMLProps,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import "./input-style.scss";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { isEqual } from "lodash";
import { Icon } from "../common/Icon";
import { useClassName } from "../../hooks/useClassName";

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
  const selectData = useRef({ listIsOpen: false }).current;
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
      if (isEqual(value, currentValue)) {
        return { ...prev, openList: false };
      }
      return { openList: false, currentValue: value };
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
    <div className="select select-container">
      <div className="select-placeholder">
        <strong>{currentValue}</strong>
        {!openList && <div className="select-trigger" onClick={toggleList} />}
        <Icon
          icon="arrow-up"
          {...useClassName("drop-icon", { down: !openList })}
        />
      </div>
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
