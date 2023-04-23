import { FC } from "react";
import { NavLink } from "react-router-dom";

interface IHeader {
  logo?: string;

}

export const Header: FC<IHeader> = ({
  logo = 'Touch Typing',

}) => {

  return (
    <header className="app-header">
      <strong>{logo}</strong>
      <nav>
        <NavLink to='typing'
          className={({ isActive }) => isActive ? "active" : ""}
        >
          TYPING
        </NavLink>
        <NavLink to='user'
          className={({ isActive }) => isActive ? "active" : ""}
        >
          USER
        </NavLink>
      </nav>
    </header>
  );
}