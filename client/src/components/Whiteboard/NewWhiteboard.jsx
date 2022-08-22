import React, { useState } from "react";
import { useLayoutEffect } from "react";
import rough from "roughjs";

const roughGenerator = rough.generator();

const createElement = (x1, y1, x2, y2, type) => {
  const roughElement =
    type === "line"
      ? roughGenerator.line(x1, y1, x2, y2)
      : roughGenerator.rectangle(x1, y1, x2 - x1, y2 - y1);
  return { x1, y1, x2, y2, roughElement };
};

const NewWhiteboard = () => {
  const [elements, setElements] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("line");

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((el) => {
      roughCanvas.draw(el.roughElement);
    });
  }, [elements]);

  const handleMouseDown = (e) => {
    const { clientX, clientY } = e;
    const element = createElement(clientX, clientY, clientX, clientY);
    setElements((prevElements) => [...prevElements, element]);
    setDrawing(true);
  };
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    if (drawing) {
      const lastElement = elements.length - 1;
      const { x1, y1 } = elements[lastElement];
      const updatedElement = createElement(x1, y1, clientX, clientY, tool);

      const allElements = [...elements];
      allElements[lastElement] = updatedElement;
      setElements(allElements);
    }
  };
  const handleMouseUp = () => {
    setDrawing(false);
  };

  return (
    <div>
      <div style={{ position: "fixed", display: "flex", gap: "1rem" }}>
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
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth - 10}
        height={window.innerHeight - 10}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};

export default NewWhiteboard;
