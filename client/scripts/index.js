import { Canvas } from './classes/Canvas.js';
import { config } from './config.js';
import { Palette } from './classes/Palette.js';
import { io } from './socket.io.js';
import {
  between,
  clearContext,
  random,
  randomHex,
  stopPropagation,
} from './utils.js';
import { InteractivityController } from './classes/InteractivityController.js';
import { localStorageKeys } from './constants.js';

const socket = io('http://127.0.0.1:8888', {
  withCredentials: true,
});

const palette = new Palette(
  document.getElementById('palette'),
  document.getElementById('palette-color-template').content,
  config.palette.colors,
  config.palette.defaultColor
);

const initialState = JSON.parse(
  localStorage.getItem(localStorageKeys.state) ?? '{}'
);

const canvas = new Canvas(config.canvas, initialState);
const overlay = new Canvas(config.canvas);
const interactivity = new InteractivityController(
  document.getElementById('canvas-wrapper')
);

canvas.render(document.getElementById('canvas'));
overlay.render(document.getElementById('canvas-overlay'));

interactivity.onWheel((scale) => {
  const size = canvas.rescale(scale);
  overlay.resize(size, false);
});

interactivity.onMouseMove(() => {
  clearContext(overlay.instance.ctx);
  const { x, y } = interactivity.cursor;
  const { width, height } = canvas.instance.element;
  if (between(x, 0, width) && between(y, 0, height)) {
    const gCoord = canvas.localToGrid(interactivity.cursor);
    overlay.draw(gCoord, { border: '#000000' });
  }
});

interactivity.onMouseClick(() => {
  const gCoord = canvas.localToGrid(interactivity.cursor);
  const params = { fill: palette.currentColor };
  canvas.set(gCoord, params);
  socket.emit('draw', { coord: gCoord, params });
});

socket.on('update', (state) => {
  state.update(state);
});

socket.on('draw', (data) => {
  const { coord: gCoord, params } = data;
  canvas.set(gCoord, params);
});

const configForms = {
  canvas: Object.keys(config.canvas),
  palette: Object.keys(config.palette),
};

const debugPanel = document.getElementById('debug-panel');
const debugForm = document.getElementById('debug-form');

for (const form in configForms) {
  for (const key of configForms[form]) {
    if (!debugForm.elements[key]) continue;
    debugForm.elements[key].value = config[form][key];
  }
}

function createState(fromPalette) {
  const state = {};
  for (let i = 0; i < canvas.width; i++) {
    for (let j = 0; j < canvas.height; j++) {
      state[`${i},${j}`] = {
        fill: fromPalette
          ? palette.colors[random(0, palette.colors.length - 1)]
          : `#${randomHex()}`,
      };
    }
  }
  return state;
}

debugForm.elements['manipulation'].addEventListener('click', (e) => {
  switch (e.target.name) {
    case 'fill-palette':
      canvas.update(createState(true));
      return;
    case 'fill-random':
      canvas.update(createState(false));
      return;
  }
});

function reducer(configKey) {
  return {
    [configKey]: configForms[configKey].reduce((res, key) => {
      return {
        ...res,
        [key]: debugForm.elements[key]
          ? debugForm.elements[key].value
          : config[configKey][key],
      };
    }, {}),
  };
}

debugForm.addEventListener('submit', (e) => {
  localStorage.setItem(
    localStorageKeys.config,
    JSON.stringify({
      ...config,
      ...reducer('canvas'),
      ...reducer('palette'),
    })
  );
});

document.getElementById('sidemenu-export').addEventListener('click', (e) => {
  e.stopPropagation();
  const canvasElement = document.createElement('canvas');
  const canvasExport = new Canvas({ ...config.canvas, pixelSize: 10 });
  canvasExport.render(canvasElement);
  canvasExport.update(canvas.state);
  canvasElement.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pixelbattle';
    link.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById('sidemenu-clear').addEventListener('click', (e) => {
  stopPropagation(e);
  clearContext(canvas.instance.ctx);
  canvas.update({});
});

document.getElementById('sidemenu-center').addEventListener('click', (e) => {
  stopPropagation(e);
  interactivity.pos = { x: 0, y: 0 };
  interactivity.commit();
});

const debugButton = document.getElementById('sidemenu-debug');
debugButton.addEventListener('click', (e) => {
  e.stopPropagation();
  const flag = debugPanel.style.display === 'block';
  debugPanel.style.display = flag ? 'none' : 'block';
});
