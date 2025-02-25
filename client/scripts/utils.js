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

export { preventDefault, stopPropagation, between, clearContext };
