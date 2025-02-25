function preventDefault(e) {
  e.preventDefault();
}

function stopPropagation(e) {
  e.stopPropagation();
}

function between(value, min, max) {
  return value > min && value < max;
}

function clearContext(context) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function random(from, to) {
  return Math.round(Math.random() * (to - from)) + from;
}

function randomHex(limit = 0xffffff) {
  return Math.floor(Math.random() * limit)
    .toString(16)
    .padEnd(6, '0');
}

export {
  preventDefault,
  stopPropagation,
  between,
  clearContext,
  random,
  randomHex,
};
