import { isServer } from './isServer.js';

export var classListSupport = isServer ? false:  'classList' in document.createElement('_');