import { isServer } from './isServer';

export var docElement = isServer ? null : document.documentElement;