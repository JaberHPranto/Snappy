import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useLayoutEffect } from "react";
import rough from "roughjs";

const roughGenerator = rough.generator();

const createElement = (x1, y1, x2, y2, type, options = {}) => {
  const roughElement =
    type === "line"
      ? roughGenerator.line(x1, y1, x2, y2, options)
      : type === "circle"
      ? roughGenerator.arc(
          x1,
          y1,
          (x2 - x1) * 2,
          (y2 - y1) * 2,
          0,
          Math.PI * 4,
          false,
          options
        )
      : roughGenerator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
  return { x1, y1, x2, y2, roughElement };
};

const NewWhiteboard = () => {
  const [elements, setElements] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("line");
  const [color, setColor] = useState("#000000");
  const canvasRef = useRef();
  const ctxRef = useRef();

  useLayoutEffect(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((el) => {
      roughCanvas.draw(el.roughElement);
    });
  }, [elements]);

  useEffect(() => {
    ctxRef.current.strokeStyle = color;
  }, [color]);

  const handleMouseDown = (e) => {
    const { clientX, clientY } = e;
    const element = createElement(clientX, clientY, clientX, clientY, tool, {
      stroke: color,
    });
    setElements((prevElements) => [...prevElements, element]);
    setDrawing(true);
  };
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    if (drawing) {
      const lastElement = elements.length - 1;
      const { x1, y1 } = elements[lastElement];
      const updatedElement = createElement(x1, y1, clientX, clientY, tool, {
        stroke: color,
      });

      const allElements = [...elements];
      allElements[lastElement] = updatedElement;
      setElements(allElements);
    }
  };
  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleClearCanvas = () => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setElements([]);
  };

  return (
    <div>
      <div
        style={{
          position: "fixed",
          width: "100%",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 2rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div>
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
          <div>
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
          <div>
            <label htmlFor="circle">Circle</label>
            <input
              type="radio"
              name="tool"
              id="circle"
              checked={tool === "circle"}
              value="circle"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
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
        <div>
          <button className="btn btn-danger" onClick={handleClearCanvas}>
            Clear
          </button>
        </div>
      </div>

      <canvas
        id="canvas"
        width={window.innerWidth - 10}
        height={window.innerHeight - 10}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};

export default NewWhiteboard;
