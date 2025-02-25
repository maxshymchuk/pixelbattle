import { localStorageKeys } from '../constants.js';
import { CanvasInstance } from './CanvasInstance.js';

class Canvas {
  #element = null;
  #instance = null;

  #state = {};
  #maxPixelSize = 40;
  #pixelSize = 1;
  #scale = 1;

  #lWidth = 0;
  #lHeight = 0;

  constructor(options, initialState = {}) {
    if (options?.width) this.#lWidth = options.width;
    if (options?.height) this.#lHeight = options.height;
    if (options?.pixelSize) this.#pixelSize = options.pixelSize;
    if (options?.scale) this.#scale = options.scale;
    this.#state = initialState;
  }

  get width() {
    return this.#lWidth;
  }

  get height() {
    return this.#lHeight;
  }

  get instance() {
    return this.#instance;
  }

  get state() {
    return this.#state;
  }

  #saveToLocalStorage() {
    try {
      localStorage.setItem(localStorageKeys.state, JSON.stringify(this.#state));
    } catch (error) {
      console.error(error);
    }
  }

  render(element) {
    if (!element) throw 'No entry point for canvas';
    this.#element = element;
    this.#instance = new CanvasInstance(
      this.#element,
      this.#lWidth * this.#pixelSize,
      this.#lHeight * this.#pixelSize
    );
    this.rescale(this.#scale);
  }

  get(gCoord) {
    return this.#state[`${gCoord.x},${gCoord.y}`];
  }

  set(gCoord, params) {
    this.#state[`${gCoord.x},${gCoord.y}`] = params;
    this.draw(gCoord, params);
    this.#saveToLocalStorage();
  }

  update(state) {
    this.#state = state;
    this.#redraw();
    this.#saveToLocalStorage();
  }

  resize({ pixelSize, width, height }, withLockedRatio = true) {
    if (pixelSize) this.#pixelSize = pixelSize;
    if (width) this.#instance.setWidth(width, withLockedRatio);
    if (height) this.#instance.setHeight(height, withLockedRatio);
  }

  rescale(scale = 1) {
    this.#pixelSize = Math.min(
      Math.max(1, this.#pixelSize * scale),
      this.#maxPixelSize
    );
    this.#instance.setWidth(this.#lWidth * this.#pixelSize);
    this.#redraw();
    return {
      pixelSize: this.#pixelSize,
      width: this.#instance.element.width,
      height: this.#instance.element.height,
    };
  }

  localToGrid(lCoord) {
    const x = Math.round((lCoord.x - this.#pixelSize / 2) / this.#pixelSize);
    const y = Math.round((lCoord.y - this.#pixelSize / 2) / this.#pixelSize);
    return {
      x: Math.min(Math.max(0, x), this.#lWidth),
      y: Math.min(Math.max(0, y), this.#lHeight),
    };
  }

  gridToLocal(gCoord) {
    return { x: gCoord.x * this.#pixelSize, y: gCoord.y * this.#pixelSize };
  }

  draw(gCoord, params) {
    this.#instance.draw(
      this.gridToLocal(gCoord),
      this.#pixelSize,
      this.#pixelSize,
      params
    );
    return { gCoord, params };
  }

  #redraw() {
    const gCoords = Object.keys(this.#state).map((rawCoord) => {
      const split = rawCoord.split(',');
      return { x: split[0], y: split[1] };
    });
    gCoords.forEach((gCoord) => {
      const params = this.get(gCoord);
      this.draw(gCoord, params);
    });
  }
}

export { Canvas };
