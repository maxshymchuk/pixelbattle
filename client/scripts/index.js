import { Canvas } from './classes/Canvas.js';
import { config } from './config.js';
import { Palette } from './classes/Palette.js';
import { io } from './socket.io.js';
import { between, clear } from './utils.js';

const socket = io('http://127.0.0.1:8888', {
  withCredentials: true,
});

const palette = new Palette(
  document.getElementById('palette'),
  document.getElementById('palette-color-template').content,
  config.palette.colors,
  config.palette.default
);

const canvasState = new Canvas(
  document.getElementById('canvas'),
  document.getElementById('canvas-overlay'),
  config.canvas.options
);

canvasState.interact.onWheel((scale) => canvasState.rescale(scale));

canvasState.interact.onMouseMove(() => {
  clear(canvasState.overlay.ctx);
  const { x, y } = canvasState.interact.cursor;
  const { width, height } = canvasState.canvas.element;
  if (between(x, 0, width) && between(y, 0, height)) {
    const gCoord = canvasState.localToGrid(canvasState.interact.cursor);
    canvasState.draw(canvasState.overlay, gCoord, { border: '#000000' });
  }
});

canvasState.interact.onMouseClick(() => {
  const gCoord = canvasState.localToGrid(canvasState.interact.cursor);
  const params = { fill: palette.currentColor };
  canvasState.set(gCoord, params);
  socket.emit('draw', { coord: gCoord, params });
});

socket.on('update', (state) => {
  canvasState.update(state);
});

socket.on('draw', (data) => {
  const { coord: gCoord, params } = data;
  canvasState.set(gCoord, params);
});
