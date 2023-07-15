import { isServer } from './isServer';

export var classListSupport = isServer ? false : 'classList' in document.createElement('_');