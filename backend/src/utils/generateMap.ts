const generateMap = () => {
  const cardValues = [
    "shrek",
    "fiona",
    "donkey",
    "puss",
    "dragon",
    "waffles",
    "onions",
    "farquaad",
    "fairyGodmother",
    "princeCharming",
    "gingy",
    "humanShrek",
    "humanFiona",
    "horseDonkey",
    "pinocchio",
    "blindMice",
    "bigBadWolf",
    "farFarAway",
    "fionaCastle",
    "swamp",
    "duloc",
  ];
  const selectedValues = [];
  for (let i = 0; i < 15; i++) {
    const randomIndex = Math.floor(Math.random() * cardValues.length);
    selectedValues.push(cardValues[randomIndex]);
    cardValues.splice(randomIndex, 1);
  }
  const mapValues = [...selectedValues, ...selectedValues];
  mapValues.sort(() => Math.random() - 0.5);
  mapValues.sort(() => Math.random() - 0.5);
  return mapValues;
};

export default generateMap;
