const colors = [
  "#ff8888",
  "#ff0000",
  "#5555ff",
  "#00ff00",
  "#00aaff",
  "#ff00aa",
  "#ff99ff",
];

class ColorService {
  getRandom() {
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default new ColorService();
