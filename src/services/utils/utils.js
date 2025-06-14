export function mapPaginationValues(value, setSize) {
  console.log("value", value);
  switch (value) {
    case "eight":
      setSize(8);
      break;
    case "twelve":
      setSize(12);
      break;
    case "twentyfour":
      setSize(24);
      break;
    case "thirtysix":
      setSize(36);
      break;
  }
}
