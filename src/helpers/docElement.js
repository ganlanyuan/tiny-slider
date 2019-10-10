import { isServer } from './isServer.js';

export var docElement = isServer ? null : document.documentElement;