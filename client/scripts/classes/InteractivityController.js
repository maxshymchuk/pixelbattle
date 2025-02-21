import { preventDefault } from '../utils.js';

class InteractivityController {
  #element = null;

  #isMoving = false;
  #startPos = { x: 0, y: 0 };
  #pos = { x: 0, y: 0 };
  #delta = { x: 0, y: 0 };

  #cursor = null;

  #wheelCallback = null;
  #wheelListener = (e) => {
    preventDefault(e);
    this.#wheelCallback?.(e);
  };

  #mouseDownListener = (e) => {
    if (e.button !== 2) return;
    const x = e.clientX;
    const y = e.clientY;
    this.#startPos = { x, y };
    this.#isMoving = true;
  };

  #cursorListener = (e) => {
    const { left, top } = this.#element.getBoundingClientRect();
    this.#cursor = {
      x: e.clientX - left,
      y: e.clientY - top,
    };
  };

  #mouseMoveCallback = null;
  #mouseMoveListener = (e) => {
    this.#mouseMoveCallback?.(e);
    if (!this.#isMoving) return;
    this.#delta = {
      x: e.clientX - this.#startPos.x,
      y: e.clientY - this.#startPos.y,
    };
    this.#element.style.transform = `translate(
        ${this.#pos.x + this.#delta.x}px,
        ${this.#pos.y + this.#delta.y}px
    )`;
  };

  #mouseUpListener = (e) => {
    if (e.button !== 2) return;
    this.#isMoving = false;
    this.#pos = {
      x: this.#pos.x + this.#delta.x,
      y: this.#pos.y + this.#delta.y,
    };
  };

  #mouseClickCallback = null;
  #mouseClickListener = (e) => {
    this.#mouseClickCallback?.(e);
  };

  constructor(element) {
    if (!element) throw 'No entry point for interactivity controller';
    this.#element = element;
    this.#element.addEventListener('click', this.#mouseClickListener);
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('wheel', this.#wheelListener, { passive: false });
    document.addEventListener('mousedown', this.#mouseDownListener);
    document.addEventListener('mousemove', this.#cursorListener);
    document.addEventListener('mousemove', this.#mouseMoveListener);
    document.addEventListener('mouseup', this.#mouseUpListener);
  }

  onWheel(callback) {
    this.#wheelCallback = (e) => {
      const STEP = 2;
      const scale = Math.sign(e.deltaY) >= 0 ? 1 / STEP : STEP;
      return callback(scale);
    };
  }

  onMouseMove = (callback) => {
    this.#mouseMoveCallback = callback;
  };

  onMouseClick = (callback) => {
    this.#mouseClickCallback = callback;
  };

  get cursor() {
    return this.#cursor;
  }
}

export { InteractivityController };
