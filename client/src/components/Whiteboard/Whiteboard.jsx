import React, { useLayoutEffect, useState } from "react";
import { useEffect } from "react";
import rough from "roughjs";

// configuring roughjs
const roughGenerator = rough.generator();

const Whiteboard = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
}) => {
  const [action, setAction] = useState("none");
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    const canvas = canvasRef?.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    ctxRef.current.strokeStyle = color;
  }, [color]);

  // useEffect(() => {
  //   console.log({ action });
  // });

  useLayoutEffect(() => {
    const roughCanvas = rough.canvas(canvasRef.current);

    // have to clear previous line before creating a new line
    if (elements.length > 0) {
      ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }

    elements.forEach((el) => {
      if (el.type === "pencil")
        roughCanvas.linearPath(el.path, {
          stroke: el.stroke,
          roughness: 0,
          strokeWidth: 3,
        });
      else if (el.type === "line") {
        roughCanvas.draw(
          roughGenerator.line(el.offsetX, el.offsetY, el.width, el.height, {
            stroke: el.stroke,
            strokeWidth: 2,
          })
        );
      } else if (el.type === "rectangle") {
        roughCanvas.draw(
          roughGenerator.rectangle(
            el.offsetX,
            el.offsetY,
            el.width,
            el.height,
            {
              stroke: el.stroke,
            }
          )
        );
      }
    });
  }, [elements]);

  const getElementPosition = (x, y) => {
    return elements.find((el) => isWithinElementBoundary(x, y, el));
  };

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "selection") {
      const element = getElementPosition(offsetX, offsetY);
      if (element) {
        setAction("moving");
        setSelectedElement(element);
        console.log(element);
      }
    } else {
      const id = elements.length;
      if (tool === "pencil") {
        setElements((prevElements) => [
          ...prevElements,
          {
            type: "pencil",
            offsetX,
            offsetY,
            path: [[offsetX, offsetY]],
            stroke: color,
            id,
          },
        ]);
      } else if (tool === "line") {
        setElements((prevElements) => [
          ...prevElements,
          {
            type: "line",
            offsetX,
            offsetY,
            width: offsetX,
            height: offsetY,
            stroke: color,
            id,
          },
        ]);
      } else if (tool === "rectangle") {
        setElements((prevElements) => [
          ...prevElements,
          {
            type: "rectangle",
            offsetX,
            offsetY,
            width: 0,
            height: 0,
            stroke: color,
            id,
          },
        ]);
      }
      setAction("drawing");
    }
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const { clientX, clientY } = e;

    if (tool === "selection") {
      e.target.style.cursor = getElementPosition(offsetX, offsetY)
        ? "move"
        : "default";
    }

    if (action === "drawing") {
      // for pencil
      if (tool === "pencil") {
        //   very last element. we need to update the path
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];
        setElements((prevElements) =>
          prevElements.map((el, i) => {
            if (i === elements.length - 1) return { ...el, path: newPath };
            else return el;
          })
        );
      }
      // for line
      else if (tool === "line") {
        setElements((prevElements) =>
          prevElements.map((el, i) => {
            if (i === elements.length - 1)
              return {
                ...el,
                width: offsetX,
                height: offsetY,
              };
            else return el;
          })
        );
      }
      // for rectangle
      else if (tool === "rectangle") {
        setElements((prevElements) =>
          prevElements.map((el, i) => {
            if (i === elements.length - 1)
              return {
                ...el,
                width: offsetX - el.offsetX,
                height: offsetY - el.offsetY,
              };
            else return el;
          })
        );
      }
    } else if (action === "moving") {
      const {
        type,
        offsetX: x1,
        offsetY: y1,
        width: x2,
        height: y2,
        id,
      } = selectedElement;

      if (type === "line") {
        setElements((prevElements) =>
          prevElements.map((el, i) => {
            if (i === id)
              return {
                ...el,
                offsetX,
                offsetY,
                width: offsetX - x1 + x2,
                height: offsetY - y1 + y2,
              };
            else return el;
          })
        );
      } else if (type === "rectangle") {
        setElements((prevElements) =>
          prevElements.map((el, i) => {
            if (i === id)
              return {
                ...el,
                offsetX,
                offsetY,
                width: x2,
                height: y2,
              };
            else return el;
          })
        );
      }
    }
  };
  const handleMouseUp = (e) => {
    setAction("none");
    setSelectedElement(null);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="h-100 w-100 border border-3 border-dark overflow-hidden"
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

const isWithinElementBoundary = (x, y, element) => {
  const { type, offsetX: x1, offsetY: y1, width: x2, height: y2 } = element;
  // if our cursor/selection within rectangle or on line
  if (type === "rectangle") {
    // const left = x1;
    // const right = x1 + x2;
    // const top = y1;
    // const bottom = y2 + y2;
    return x1 + x2 > x && x1 < x && y1 + y2 > y && y1 < y;
  } else if (type === "line") {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < 1 || (x2 > x && x1 < x && y2 > y && y1 < y);
  }
};

const distance = (a, b) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) - Math.pow(a.y - b.y, 2));
};

export default Whiteboard;
