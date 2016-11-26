import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `responsive`
  .page(address);

test('responsive: breakpoints', async t => {
  await t
    .resizeWindow(900, windowHeight);

  // check sliders position
  var innerWidth = await getWindowInnerWidth();
  var container = await select('#responsive');
  var slide10 = await container.getChildElement(10);
  var slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);
  
  await t
    .resizeWindow(720, windowHeight);

  innerWidth = await getWindowInnerWidth();
  slide10 = await container.getChildElement(10);
  var slide11 = await container.getChildElement(11);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide11.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .resizeWindow(540, windowHeight);

  innerWidth = await getWindowInnerWidth();
  slide10 = await container.getChildElement(10);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide10.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .resizeWindow(930, windowHeight);

  innerWidth = await getWindowInnerWidth();
  slide10 = await container.getChildElement(10);
  slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

});
