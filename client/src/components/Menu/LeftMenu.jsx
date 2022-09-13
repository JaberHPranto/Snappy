import React, { useState } from "react";
import { BsSave, BsFillPeopleFill } from "react-icons/bs";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FiSettings } from "react-icons/fi";
import "./menu.css";
import SettingsDrawer from "./Drawer/SettingsDrawer";

const LeftMenu = ({ handleClearCanvas }) => {
  const [opened, setOpened] = useState(false);
  return (
    <div className="left_menu-buttons">
      {opened && <SettingsDrawer opened={opened} setOpened={setOpened} />}
      <button className="leftMenuBtn" onClick={handleClearCanvas}>
        <RiDeleteBin5Line size={20} />
      </button>
      <button className="leftMenuBtn">
        <BsSave size={20} />
      </button>
      <button className="leftMenuBtn">
        <BsFillPeopleFill size={20} />
      </button>
      <button className="leftMenuBtn" onClick={() => setOpened(true)}>
        <FiSettings size={20} />
      </button>
    </div>
  );
};

export default LeftMenu;
