import React, { useLayoutEffect, useState } from "react";
import { useEffect } from "react";
import rough from "roughjs";

// configuring roughjs
const roughGenerator = rough.generator();

const Whiteboard = ({ canvasRef, ctxRef, elements, setElements, tool }) => {
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef?.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
  }, []);

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
          roughGenerator.line(el.offsetX, el.offsetY, el.width, el.height)
        );
      } else if (el.type === "rectangle") {
        roughCanvas.draw(
          roughGenerator.rectangle(el.offsetX, el.offsetY, el.width, el.height)
        );
      }
    });
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: "black",
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
          stroke: "black",
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
          stroke: "black",
        },
      ]);
    }
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDrawing) {
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
    }
  };
  const handleMouseUp = (e) => {
    setIsDrawing(false);
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

export default Whiteboard;
