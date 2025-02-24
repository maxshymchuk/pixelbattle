import { Canvas } from './classes/Canvas.js';
import { config as defaultConfig } from './config.js';
import { Palette } from './classes/Palette.js';
import { io } from './socket.io.js';
import { between, clearContext } from './utils.js';
import { InteractivityController } from './classes/InteractivityController.js';
import { localStorageKey } from './constants.js';

const socket = io('http://127.0.0.1:8888', {
  withCredentials: true,
});

const config = {
  ...defaultConfig,
  ...JSON.parse(localStorage.getItem(localStorageKey) ?? '{}'),
};

const palette = new Palette(
  document.getElementById('palette'),
  document.getElementById('palette-color-template').content,
  config.palette.colors,
  config.palette.defaultColor
);

const canvas = new Canvas(config.canvas);
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
    localStorageKey,
    JSON.stringify({
      ...config,
      ...reducer('canvas'),
      ...reducer('palette'),
    })
  );
});

const exportButton = document.getElementById('sidemenu-export');
exportButton.addEventListener('click', (e) => {
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

const debugButton = document.getElementById('sidemenu-debug');
debugButton.addEventListener('click', (e) => {
  e.stopPropagation();
  const flag = debugPanel.style.display === 'block';
  debugPanel.style.display = flag ? 'none' : 'block';
});

const debugClear = document.getElementById('debug-clear');
debugClear.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  clearContext(canvas.instance.ctx);
  canvas.update({});
});
