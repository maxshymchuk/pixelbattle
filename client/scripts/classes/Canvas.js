import { CanvasInstance } from './CanvasInstance.js';
import { InteractivityController } from './InteractivityController.js';

class Canvas {
  #canvasElement = null;
  #overlayElement = null;
  #interact = null;

  #canvas = null;
  #overlay = null;

  #state = {};
  #maxPixelSize = 40;
  #pixelSize = 1;
  #scale = 1;

  #lWidth = 0;
  #lHeight = 0;

  constructor(canvasElement, overlayElement, options) {
    if (!canvasElement) throw 'No entry point for canvas';
    if (!overlayElement) throw 'No entry point for overlay';
    this.#canvasElement = canvasElement;
    this.#overlayElement = overlayElement;
    if (options?.width) this.#lWidth = options.width;
    if (options?.height) this.#lHeight = options.height;
    if (options?.pixelSize) this.#pixelSize = options.pixelSize;
    if (options?.scale) this.#scale = options.scale;
    this.#canvas = new CanvasInstance(
      this.#canvasElement,
      this.#lWidth * this.#pixelSize,
      this.#lHeight * this.#pixelSize
    );
    this.#overlay = new CanvasInstance(
      this.#overlayElement,
      this.#lWidth * this.#pixelSize,
      this.#lHeight * this.#pixelSize
    );
    this.#interact = new InteractivityController(
      this.#canvasElement.parentNode
    );
    this.rescale(this.#scale);
  }

  get canvas() {
    return this.#canvas;
  }

  get overlay() {
    return this.#overlay;
  }

  get interact() {
    return this.#interact;
  }

  get(gCoord) {
    return this.#state[`${gCoord.x},${gCoord.y}`];
  }

  set(gCoord, params) {
    this.#state[`${gCoord.x},${gCoord.y}`] = params;
    this.draw(this.#canvas, gCoord, params);
  }

  update(state) {
    this.#state = state;
    this.#redraw();
  }

  rescale(scale = 1) {
    this.#pixelSize = Math.min(
      Math.max(1, this.#pixelSize * scale),
      this.#maxPixelSize
    );
    this.#canvas.setWidth(this.#lWidth * this.#pixelSize);
    this.#overlay.setWidth(this.#canvas.element.width);
    this.#redraw();
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

  draw(instance, gCoord, params) {
    instance.draw(
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
      this.draw(this.#canvas, gCoord, params);
    });
  }
}

export { Canvas };
