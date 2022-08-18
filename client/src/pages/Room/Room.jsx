import React, { useState } from "react";
import { useRef } from "react";
import Whiteboard from "../../components/Whiteboard/Whiteboard";
import "./room.css";

const RoomPage = () => {
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  return (
    <div>
      <h1 className="text-center pt-5 pb-2">
        White Board Sharing App{" "}
        <span className="fw-bold text-primary">[User online: 0]</span>
      </h1>

      {/* Controls */}
      <div className="col-md-12 my-3 px-5 gap-5 d-flex align-items-center justify-content-around">
        {/* tools */}
        <div className="col-md-3 d-flex justify-content-between gap-1">
          <div className="d-flex gap-1">
            <label htmlFor="pencil">Pencil</label>
            <input
              type="radio"
              name="tool"
              id="pencil"
              checked={tool === "pencil"}
              value="pencil"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
          <div className="d-flex gap-1">
            <label htmlFor="line">Line</label>
            <input
              type="radio"
              name="tool"
              id="line"
              checked={tool === "line"}
              value="line"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
          <div className="d-flex gap-1">
            <label htmlFor="rectangle">Rectangle</label>
            <input
              type="radio"
              name="tool"
              id="rectangle"
              checked={tool === "rectangle"}
              value="rectangle"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
        </div>
        {/* color picker */}
        <div className="col-md-7">
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="color">Select Color</label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>
        {/* buttons */}
        <div className="col-md-3 d-flex gap-2">
          <button className="btn btn-primary mt-1">Undo</button>
          <button className="btn btn-outline-primary mt-1">Redo</button>
          <button className="btn btn-danger mt-1">Clear Canvas</button>
        </div>
      </div>
      {/* Canvas */}
      <div className="col-md-10 mx-auto mt-4 border canvasBox">
        <Whiteboard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          tool={tool}
        />
      </div>
    </div>
  );
};

export default RoomPage;
