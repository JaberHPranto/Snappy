import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useLayoutEffect } from "react";
import rough from "roughjs";

const roughGenerator = rough.generator();
const THRESHOLD = 5;

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

    case "image":
      return { id, x1, y1, x2, y2, imageSrc: options.imageSrc, type, options };

    default:
      throw new Error(`${type} type not recognized`);
  }
};

const getPosition = (x, y, elements) => {
  return elements
    .map((el) => {
      return {
        ...el,
        position: positionWithinBoundary(x, y, el),
      };
    })
    .find((el) => el.position !== null);
};

const positionWithinBoundary = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  if (type === "rectangle") {
    // for resizing
    const topLeft = nearPosition(x, y, x1, y1, "tl");
    const topRight = nearPosition(x, y, x2, y1, "tr");
    const bottomLeft = nearPosition(x, y, x1, y2, "bl");
    const bottomRight = nearPosition(x, y, x2, y2, "br");
    const isInside = x1 <= x && x <= x2 && y2 >= y && y1 <= y ? "inside" : null;
    return topLeft || topRight || bottomLeft || bottomRight || isInside;
  } else if (type === "line") {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    // for resizing
    const start = nearPosition(x, y, x1, y1, "start");
    const end = nearPosition(x, y, x2, y2, "end");
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    const isInside =
      Math.abs(offset) < 1 || (x2 > x && x1 < x && y2 > y && y1 < y)
        ? "inside"
        : null;
    return start || end || isInside;
  } else if (type === "circle") {
    const r = ((x2 * x2) / (8 * y2) + y2 / 2) / 4;
    const w = (x2 - x1) * 2;
    const h = (y2 - y1) * 2;
    const left = nearPosition(x, y, x1 + w / 2, y1, "lt");
    const right = nearPosition(x, y, x1 - w / 2, y1, "rt");
    const top = nearPosition(x, y, x1, y1 + h / 2, "tp");
    const bottom = nearPosition(x, y, x1, y1 - h / 2, "bm");
    const isInside =
      Math.pow(x - x1, 2) + Math.pow(y - y1, 2) < Math.pow(r, 2)
        ? "inside"
        : null;
    return left || right || top || bottom || isInside;
  } else if (type === "text") {
    return x1 <= x && x <= x2 && y2 >= y && y1 <= y ? "inside" : null;
  } else if (type === "image") {
    const minX = Math.min(x1, x1 + x2);
    const maxX = Math.max(x1, x1 + x2);
    const minY = Math.min(y1, y1 + y2);
    const maxY = Math.max(y1, y1 + y2);

    const topLeft = nearPosition(x, y, x1, y1, "itl");
    const topRight = nearPosition(x, y, x1 + x2, y1, "itr");
    const bottomLeft = nearPosition(x, y, x1, y1 + y2, "ibl");
    const bottomRight = nearPosition(x, y, x1 + x2, y1 + y2, "ibr");

    const isInside =
      minX <= x && x <= maxX && maxY >= y && minY <= y ? "inside" : null;
    return topLeft || topRight || bottomLeft || bottomRight || isInside;
  } else throw new Error(`${type} is not supported`);
};

const distance = (a, b) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) - Math.pow(a.y - b.y, 2));
};

const nearPosition = (x, y, x1, y1, position) => {
  return Math.abs(Math.abs(x - x1) < THRESHOLD && Math.abs(y - y1) < THRESHOLD)
    ? position
    : null;
};

const getCursorForPosition = (position) => {
  switch (position) {
    case "tl":
    case "itl":
    case "br":
    case "ibr":
      return "nwse-resize";
    case "tr":
    case "itr":
    case "bl":
    case "ibl":
      return "nesw-resize";
    case "rt":
    case "start":
    case "lt":
    case "end":
      return "w-resize";
    case "tp":
    case "bm":
      return "n-resize";
    default:
      return "move";
  }
};

// so that all co-ordinates remain consistent irrespective of how we draw -> (x1,y1) <= (x2,y2).It helps for resizing
const adjustElementCoordinates = (element) => {
  const { x1, y1, x2, y2, type } = element;
  if (type === "rectangle" || type === "text") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else if (type === "line") {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) return { x1, y1, x2, y2 };
    else return { x1: x2, y1: y2, x2: x1, y2: y1 };
  }
};

const resizeCoordinates = (mouseX, mouseY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: mouseX, y1: mouseY, x2, y2 };
    case "tr":
      return { x1, y1: mouseY, x2: mouseX, y2 };
    case "bl":
      return { x1: mouseX, y1, x2, y2: mouseY };
    case "br":
    case "end":
      return { x1, y1, x2: mouseX, y2: mouseY };
    case "tp":
    case "bm":
      return { x1, y1, x2, y2: mouseY };
    case "rt":
    case "lt":
      return { x1, y1, x2: mouseX, y2 };
    case "itl":
      return {
        x1: mouseX,
        y1: mouseY,
        x2: x2 + x1 - mouseX,
        y2: y2 + y1 - mouseY,
      };
    case "itr":
      return { x1, y1: mouseY, x2: mouseX - x1, y2: y2 + y1 - mouseY };
    case "ibl":
      return { x1: mouseX, y1, x2: x1 + x2 - mouseX, y2: mouseY - y1 };
    case "ibr":
      return { x1, y1, x2: mouseX - x1, y2: mouseY - y1 };
    default:
      return { x1, y1, x2, y2 };
  }
};

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

const NewWhiteboard = () => {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("text");
  const [color, setColor] = useState("#000000");
  const [selectedElement, setSelectedElement] = useState(null);
  const [count, setCount] = useState(1);
  const [file, setFile] = useState(null);

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
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
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
      if (action === "drawing" && type !== "circle") {
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

  const handleClearCanvas = () => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setElements([]);
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
          <div>
            <label htmlFor="text">Text</label>
            <input
              type="radio"
              name="tool"
              id="text"
              checked={tool === "text"}
              value="text"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="selection">Selection</label>
            <input
              type="radio"
              name="tool"
              id="selection"
              checked={tool === "selection"}
              value="selection"
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
          <button className="btn btn-primary" onClick={handleUpload}>
            Add
          </button>
          <input type="file" onChange={handleUpload} />
          <button className="btn btn-danger" onClick={handleClearCanvas}>
            Clear
          </button>
        </div>
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
