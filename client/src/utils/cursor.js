export const getCursorForPosition = (position) => {
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
