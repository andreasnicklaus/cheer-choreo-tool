const colors = [
  "#FF8888",
  "#FF0000",
  "#5555FF",
  "#00FF00",
  "#00AAFF",
  "#FF00AA",
  "#FF99FF",
  "#FFBDF6",
  "#A2FBA2",
  "#96DBFD",
  "#FF1493",
  "#C71585",
  "#4B0082",
  "#9400D3",
  "#6A5ACD",
  "#8B0000",
  "#FF4500",
  "#FF8C00",
  "#006400",
  "#228B22",
  "#00008B",
  "#0000FF",
  "#1E90FF",
  "#A52A2A",
  "#008080",
  "#48D1CC",
  "#00FFFF",
  "#2F4F4F",
  "#FFFF00",
];

class ColorService {
  getRandom(alreadyUsedColors = []) {
    let possibleColors = colors.filter(
      (color) =>
        alreadyUsedColors.length == 0 || !alreadyUsedColors.includes(color)
    );
    if (possibleColors.length == 0) possibleColors = colors;
    return possibleColors[Math.floor(Math.random() * possibleColors.length)];
  }
}

export default new ColorService();
