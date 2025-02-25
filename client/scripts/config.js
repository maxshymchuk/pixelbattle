import { localStorageKeys } from './constants.js';

const defaultConfig = {
  zoomScale: 1.3,
  canvas: {
    width: 150,
    height: 150 / 1.5,
    pixelSize: 8,
    exportPixelSize: 10,
  },
  palette: {
    colors: [
      '#000000',
      '#9D9D9D',
      '#FFFFFF',
      '#BE2633',
      '#E06F8B',
      '#493C2B',
      '#A46422',
      '#EB8931',
      '#F7E26B',
      '#2F484E',
      '#44891A',
      '#A3CE27',
      '#1B2632',
      '#005784',
      '#31A2F2',
      '#B2DCEF',
    ],
    defaultColor: '#000000',
  },
};

const config = {
  ...defaultConfig,
  ...JSON.parse(localStorage.getItem(localStorageKeys.config) ?? '{}'),
};

export { config };
