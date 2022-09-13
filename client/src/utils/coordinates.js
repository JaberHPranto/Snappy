// so that all co-ordinates remain consistent irrespective of how we draw -> (x1,y1) <= (x2,y2).It helps for resizing
export const adjustElementCoordinates = (element) => {
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

export const resizeCoordinates = (mouseX, mouseY, position, coordinates) => {
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
