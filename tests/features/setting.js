import { Selector } from 'testcafe';

// export const address = 'http://172.20.20.20:3000/tests/index.html';
export const address = 'http://192.168.103.82:3000/tests/index.html';
export const speed1 = 100;
export const gutter = 10;
export const edgePadding = 50;
export const windowWidthes = [400, 800, 1200, 1600];
export const windowHeight = 900;
export const select = Selector(id => document.querySelector(`${id}`));