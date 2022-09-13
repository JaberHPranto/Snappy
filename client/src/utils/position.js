const THRESHOLD = 5;

export const getPosition = (x, y, elements) => {
  return elements
    .map((el) => {
      return {
        ...el,
        position: positionWithinBoundary(x, y, el),
      };
    })
    .find((el) => el.position !== null);
};

export const positionWithinBoundary = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  if (type === "rectangle") {
    /* Rectangle */
    const topLeft = nearPosition(x, y, x1, y1, "tl");
    const topRight = nearPosition(x, y, x2, y1, "tr");
    const bottomLeft = nearPosition(x, y, x1, y2, "bl");
    const bottomRight = nearPosition(x, y, x2, y2, "br");
    const isInside = x1 <= x && x <= x2 && y2 >= y && y1 <= y ? "inside" : null;
    return topLeft || topRight || bottomLeft || bottomRight || isInside;
  } else if (type === "line") {
    /* Line */
    const start = nearPosition(x, y, x1, y1, "start");
    const end = nearPosition(x, y, x2, y2, "end");
    const on = onLine(x1, y1, x2, y2, x, y);
    return start || end || on;
  } else if (type === "circle") {
    /* Circle */
    const r = ((x2 * x2) / (8 * y2) + y2 / 2) / 8;
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
    /* Text */
    return x1 <= x && x <= x2 && y2 >= y && y1 <= y ? "inside" : null;
  } else if (type === "pencil") {
    /* Pencil */
    const betweenAnyPoint = element.points.some((point, index) => {
      const nextPointTuple = element.points[index + 1];
      if (!nextPointTuple) return false;
      return (
        onLine(point.x, point.y, nextPointTuple.x, nextPointTuple.y, x, y, 5) !=
        null
      );
    });

    return betweenAnyPoint ? "inside" : null;
  } else if (type === "image") {
    /* Image */
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

const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ||
    (x2 > x && x1 < x && y2 > y && y1 < y)
    ? "inside"
    : null;
};

const distance = (a, b) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) - Math.pow(a.y - b.y, 2));
};

const nearPosition = (x, y, x1, y1, position) => {
  return Math.abs(Math.abs(x - x1) < THRESHOLD && Math.abs(y - y1) < THRESHOLD)
    ? position
    : null;
};
