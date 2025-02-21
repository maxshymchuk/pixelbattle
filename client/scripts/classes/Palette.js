class Palette {
  #element = null;
  #currentColor;

  constructor(element, template, colors, initial) {
    if (!element) throw 'No entry point for palette';
    if (!template) throw 'No template for palette color';
    this.#element = element;
    const nodes = [];
    if (initial) this.#currentColor = initial;
    colors.forEach((color) => {
      const paletteColor = template.cloneNode(true);
      const label = paletteColor.querySelector('label');
      const input = paletteColor.querySelector('input');
      label.for = color;
      label.style.backgroundColor = color;
      input.id = color;
      input.value = color;
      input.checked = color === this.#currentColor;
      nodes.push(paletteColor);
    });
    this.#element.replaceChildren(...nodes);

    this.#element.addEventListener('change', (e) => {
      const newColor = e.target.value;
      this.#currentColor = newColor;
    });
  }

  get currentColor() {
    return this.#currentColor;
  }
}

export { Palette };
