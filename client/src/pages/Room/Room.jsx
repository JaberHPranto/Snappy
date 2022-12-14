import React, { useState } from "react";
import { useRef } from "react";
import "./room.css";

const RoomPage = () => {
  const [tool, setTool] = useState("text");
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    setElements([]);
  };

  const handleUndo = () => {
    const lastElement = elements[elements.length - 1];
    setHistory((prev) => [...prev, lastElement]);
    setElements((prevElements) =>
      prevElements.slice(0, prevElements.length - 1)
    );
  };

  const handleRedo = () => {
    setElements((prevElements) => [
      ...prevElements,
      history[history.length - 1],
    ]);
    setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
  };

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
            <label htmlFor="pencil">P</label>
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
            <label htmlFor="line">L</label>
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
            <label htmlFor="rectangle">R</label>
            <input
              type="radio"
              name="tool"
              id="rectangle"
              checked={tool === "rectangle"}
              value="rectangle"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
          <div className="d-flex gap-1">
            <label htmlFor="selection">S</label>
            <input
              type="radio"
              name="tool"
              id="selection"
              checked={tool === "selection"}
              value="selection"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
          <div className="d-flex gap-1">
            <label htmlFor="text">T</label>
            <input
              type="radio"
              name="tool"
              id="text"
              checked={tool === "text"}
              value="text"
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
          <button
            className="btn btn-primary mt-1"
            disabled={elements.length === 0}
            onClick={handleUndo}
          >
            Undo
          </button>
          <button
            className="btn btn-outline-primary mt-1"
            disabled={history.length < 1}
            onClick={handleRedo}
          >
            Redo
          </button>
          <button className="btn btn-danger mt-1" onClick={handleClearCanvas}>
            Clear Canvas
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
