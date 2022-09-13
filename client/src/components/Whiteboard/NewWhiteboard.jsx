import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useLayoutEffect } from "react";
import rough from "roughjs";
import { getStroke } from "perfect-freehand";
import { getPosition } from "../../utils/position";
import { getCursorForPosition } from "../../utils/cursor";
import {
  adjustElementCoordinates,
  resizeCoordinates,
} from "../../utils/coordinates";
import "./whiteboard.css";
import Controls from "../Controls/Controls";

const roughGenerator = rough.generator();

const createElement = (id, x1, y1, x2, y2, type, options = {}) => {
  switch (type) {
    case "line":
    case "rectangle":
    case "circle":
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
      return { id, x1, y1, x2, y2, roughElement, type, options };

    case "text":
      return { id, x1, y1, x2, y2, text: "", type, options };

    case "pencil":
      return { id, type, points: [{ x: x1, y: y1 }], options };

    case "image":
      return { id, x1, y1, x2, y2, imageSrc: options.imageSrc, type, options };

    default:
      throw new Error(`${type} type not recognized`);
  }
};

function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}

const drawElementOnCanvas = (roughCanvas, context, element) => {
  switch (element.type) {
    case "line":
    case "rectangle":
    case "circle":
      roughCanvas.draw(element.roughElement);
      break;
    case "text":
      context.textBaseline = "top";
      context.font = "24px Handlee";
      context.fillText(element.text, element.x1, element.y1);
      break;
    case "pencil":
      const outlinePoints = getStroke(element.points, {
        size: 8,
      });
      const stroke = getSvgPathFromStroke(outlinePoints);
      const myPath = new Path2D(stroke);
      context.fill(myPath);
      break;
    case "image":
      context.drawImage(
        element.imageSrc,
        element.x1,
        element.y1,
        element.x2,
        element.y2
      );
      break;
    default:
      throw new Error(`${element.type} type not recognized`);
  }
};

const isAdjustmentRequired = (type) => {
  return type !== "circle" && type !== "pencil";
};

const NewWhiteboard = () => {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [selectedElement, setSelectedElement] = useState(null);
  const [count, setCount] = useState(1);
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);

  const canvasRef = useRef();
  const ctxRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    const textArea = textareaRef.current;
    if (action === "writing") {
      textArea.focus();
      textArea.value = selectedElement?.text;
    }
  });

  useLayoutEffect(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);
    ctx.lineCap = "arrow";

    elements.forEach((element) => {
      drawElementOnCanvas(roughCanvas, ctx, element);
    });
  }, [elements]);

  useEffect(() => {
    ctxRef.current.strokeStyle = color;
  }, [color]);

  const handleMouseDown = (e) => {
    if (action === "writing") {
      return;
    }
    const { clientX, clientY } = e;
    if (tool === "selection") {
      const element = getPosition(clientX, clientY, elements);
      if (element) {
        if (element.type === "pencil") {
          // calculating offsets for every point
          const xOffsets = element.points.map((point) => clientX - point.x);
          const yOffsets = element.points.map((point) => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        if (element.position === "inside") {
          setAction("moving");
        } else setAction("resizing");
      }
    } else {
      // drawing
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
        {
          stroke: color,
          strokeWidth: 2,
        }
      );
      setElements((prevElements) => [...prevElements, element]);
      setSelectedElement(element);
      setAction(tool === "text" ? "writing" : "drawing");
    }
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    if (tool === "selection") {
      const element = getPosition(clientX, clientY, elements);
      e.target.style.cursor = element
        ? getCursorForPosition(element.position)
        : "default";
    }
    if (action === "drawing") {
      const index = selectedElement.id;
      const { x1, y1, id } = elements[index];
      updatedElement(id, x1, y1, clientX, clientY, tool, {
        stroke: color,
        strokeWidth: 2,
      });
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => {
          return {
            x: clientX - selectedElement.xOffsets[index],
            y: clientY - selectedElement.yOffsets[index],
          };
        });
        const allElements = [...elements];
        allElements[selectedElement.id] = {
          ...allElements[selectedElement.id],
          points: newPoints,
        };
        setElements(allElements);
      } else {
        const { id, x1, y1, x2, y2, type, offsetX, offsetY, options } =
          selectedElement;
        if (type === "image") {
          const newX = clientX - offsetX;
          const newY = clientY - offsetY;
          updatedElement(id, newX, newY, x2, y2, "image", options);
        } else {
          const width = x2 - x1;
          const height = y2 - y1;
          const newX = clientX - offsetX;
          const newY = clientY - offsetY;

          updatedElement(
            id,
            newX,
            newY,
            newX + width,
            newY + height,
            type,
            options
          );
        }
      }
    } else if (action === "resizing") {
      const { id, type, position, options, ...coordinates } = selectedElement;

      const { x1, y1, x2, y2 } = resizeCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );
      updatedElement(id, x1, y1, x2, y2, type, options);
    }
  };

  const handleMouseUp = (e) => {
    const { clientX, clientY } = e;
    if (action === "writing") {
      return;
    }
    if (selectedElement) {
      // basically if we click on the selectedElement means we are on the same spot, then we go to text editing mode
      if (
        selectedElement.type === "text" &&
        clientX === selectedElement.x1 + selectedElement.offsetX &&
        clientY === selectedElement.y1 + selectedElement.offsetY
      ) {
        setAction("writing");
        setCount((prevCount) => prevCount + 1);
        return;
      }
      const element = elements[elements.length - 1];
      const { id, type } = element;
      if (action === "drawing" && isAdjustmentRequired(type)) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(element);
        updatedElement(id, x1, y1, x2, y2, type, {
          stroke: color,
          strokeWidth: 2,
        });
      }
    }

    setAction("none");
    setSelectedElement(null);
  };

  const updatedElement = (id, x1, y1, x2, y2, type, options = {}) => {
    const allElements = [...elements];
    switch (type) {
      case "line":
      case "rectangle":
      case "circle":
      case "image":
        allElements[id] = createElement(id, x1, y1, x2, y2, type, options);
        break;
      case "pencil":
        allElements[id].points = [...allElements[id].points, { x: x2, y: y2 }];
        break;
      case "text":
        const textWidth = ctxRef.current.measureText(options.text).width;
        const textHeight = 16;
        allElements[id] = {
          ...createElement(
            id,
            x1,
            y1,
            x1 + textWidth,
            y1 + textHeight,
            type,
            options
          ),
          text: options.text,
        };
      default:
        break;
    }

    setElements(allElements);
  };

  const handleBlur = (event) => {
    if (count % 2 == 0) {
      const { id, x1, y1, type } = selectedElement;
      setAction("none");
      setSelectedElement(null);
      updatedElement(id, x1, y1, null, null, type, {
        text: event.target.value,
      });
    }
    setCount((prevCount) => prevCount + 1);
  };

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(uploadedFile);
    // img.src =
    //   "https://images.unsplash.com/photo-1661493817349-f3e37cc05d5d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";

    img.onload = () => {
      const canvas = canvasRef.current;
      const imageWidth = img.width * 0.25;
      const imageHeight = img.height * 0.25;
      const centerX = canvas.width / 2 - imageWidth / 2;
      const centerY = canvas.height / 2 - imageHeight / 2;

      const element = createElement(
        elements.length,
        centerX,
        centerY,
        imageWidth,
        imageHeight,
        "image",
        {
          imageSrc: img,
        }
      );
      setElements((prevElements) => [...prevElements, element]);
      setSelectedElement(element);
    };
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
  const handleUndo = () => {
    setHistory((prevHistory) => [
      ...prevHistory,
      elements[elements.length - 1],
    ]);
    setElements((prevElements) => prevElements.slice(0, elements.length - 1));
  };
  const handleRedo = () => {
    setElements((prevElements) => [
      ...prevElements,
      history[history.length - 1],
    ]);
    setHistory((prevHistory) => prevHistory.slice(0, history.length - 1));
  };

  return (
    <div className="whiteboard-container">
      {/* Controls */}
      <Controls
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        handleClearCanvas={handleClearCanvas}
        handleUpload={handleUpload}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
        }}
      >
        <button
          className="btn btn-primary mx-2"
          disabled={elements.length === 0}
          onClick={handleUndo}
        >
          Undo
        </button>
        <button
          className="btn btn-outline-primary"
          disabled={history.length < 1}
          onClick={handleRedo}
        >
          Redo
        </button>
      </div>

      {action === "writing" ? (
        <textarea
          onBlur={handleBlur}
          ref={textareaRef}
          autoFocus
          style={{
            position: "fixed",
            top: selectedElement.y1,
            left: selectedElement.x1,
            fontFamily: "Indie Flower",
            fontSize: "20px",
            resize: "both",
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
          }}
        />
      ) : null}

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
