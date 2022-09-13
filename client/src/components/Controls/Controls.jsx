import React from "react";
import { TbSquare, TbCircle, TbPencil } from "react-icons/tb";
import { AiOutlineLine } from "react-icons/ai";
import { ImTextColor } from "react-icons/im";
import { BiSelection, BiText } from "react-icons/bi";
import { MdOutlineColorLens } from "react-icons/md";
import { RiImageAddLine } from "react-icons/ri";
import "../Controls/controls.css";

const Controls = ({
  tool,
  setTool,
  color,
  setColor,
  handleUpload,
  handleClearCanvas,
}) => {
  return (
    <div className="controls_container">
      <div className="controls_basic">
        <div className="control">
          <input
            type="radio"
            name="tool"
            id="line"
            checked={tool === "line"}
            value="line"
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="line">
            <AiOutlineLine className="control-icon" size={22} />
          </label>
        </div>
        <div className="control">
          <input
            type="radio"
            name="tool"
            id="pencil"
            checked={tool === "pencil"}
            value="pencil"
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="pencil">
            <TbPencil className="control-icon" size={22} />
          </label>
        </div>
        <div className="control">
          <input
            type="radio"
            name="tool"
            id="rectangle"
            checked={tool === "rectangle"}
            value="rectangle"
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="rectangle">
            <TbSquare className="control-icon" size={22} />
          </label>
        </div>
        <div className="control">
          <input
            type="radio"
            name="tool"
            id="circle"
            checked={tool === "circle"}
            value="circle"
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="circle">
            <TbCircle className="control-icon" size={22} />
          </label>
        </div>
        <div className="control">
          <input
            type="radio"
            name="tool"
            id="text"
            checked={tool === "text"}
            value="text"
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="text">
            <BiText className="control-icon" size={22} />
          </label>
        </div>
        <div className="control">
          <input
            type="radio"
            name="tool"
            id="selection"
            checked={tool === "selection"}
            value="selection"
            onChange={(e) => setTool(e.target.value)}
          />
          <label htmlFor="selection">
            <BiSelection className="control-icon" size={22} />
          </label>
        </div>
        {/* <div className="d-flex align-items-center gap-2">
          <label htmlFor="color">
            <MdOutlineColorLens />
          </label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div> */}
        <div className="control control_file-input">
          <input
            type="file"
            onChange={(e) => handleUpload(e)}
            id="imageUpload"
            hidden
          />
          <label htmlFor="imageUpload">
            <RiImageAddLine className="control-icon" size={22} />
          </label>
        </div>
      </div>
      <div>
        {/* <button className="btn btn-danger" onClick={handleClearCanvas}>
          Clear
        </button> */}
      </div>
    </div>
  );
};

export default Controls;
