import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

export const address = 'http://10.0.0.59:3000/tests/index.html';
// export const address = 'http://192.168.0.71:3000/tests/index.html';
export const speed1 = 100;
export const gutter = 10;
export const items = 3;
export const slideCount = 7;
export const edgePadding = 50;
export const windowWidthes = [450, 900, 1200, 1500];
export const windowHeight = 900;
export const multiplyer = 100;
// export const tabindex = 'tabIndex';
export const tabindex = 'tabindex';
export const select = Selector(id => document.querySelector(`${id}`));
export const getWindowInnerWidth = ClientFunction(() => (document.documentElement || document.body.parentNode || document.body).clientWidth);
export const absRound = ClientFunction((num) => Math.abs(Math.round(num)));
export const getTabindex = ClientFunction((el) => el.getAttribute('tabindex') || el.getAttribute('tabIndex'));