class CanvasInstance {
  #element = null;

  #ctx = null;
  #ratio = 1;
  #lockRatio = true;

  constructor(element, width, height, options) {
    this.#element = element;
    this.#ctx = element.getContext('2d');
    this.#ratio = width / height;
    this.#lockRatio = options?.lockRatio ?? true;
    this.setWidth(width);
    this.setHeight(height);
  }

  setWidth(callbackOrValue, lockRatio = this.#lockRatio) {
    if (typeof callbackOrValue === 'function') {
      this.#element.width = callbackOrValue(this.#element.width);
    } else {
      this.#element.width = callbackOrValue;
    }
    if (lockRatio) {
      this.#element.height = this.#element.width / this.#ratio;
    } else {
      this.#ratio = this.#element.width / this.#element.height;
    }
  }

  setHeight(callbackOrValue, lockRatio = this.#lockRatio) {
    if (typeof callbackOrValue === 'function') {
      this.#element.height = callbackOrValue(this.#element.height);
    } else {
      this.#element.height = callbackOrValue;
    }
    if (lockRatio) {
      this.#element.width = this.#element.height * this.#ratio;
    } else {
      this.#ratio = this.#element.width / this.#element.height;
    }
  }

  draw(coord, width, height, { fill, border }) {
    if (fill) {
      this.#ctx.fillStyle = fill;
      this.#ctx.fillRect(coord.x, coord.y, width, height);
    }
    if (border) {
      this.#ctx.strokeStyle = border;
      this.#ctx.strokeRect(coord.x, coord.y, width, height);
    }
  }

  get element() {
    return this.#element;
  }

  get ctx() {
    return this.#ctx;
  }
}

export { CanvasInstance };
