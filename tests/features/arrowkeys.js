import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `arrowKeys`
  .page(address);

test('arrowKeys: ', async t => {
  await t
    .resizeWindow(windowWidthes[1], windowHeight);

  // check sliders position
  var innerWidth = await getWindowInnerWidth();
  var container = await select('#arrowKeys');
  var slide10 = await container.getChildElement(10);
  var slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);
  
  await t
    .pressKey('right')
    .wait(speed1);

  var slide11 = await container.getChildElement(11);
  var slide13 = await container.getChildElement(13);
  expect(Math.round(slide11.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide13.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .pressKey('right')
    .wait(speed1);

  slide12 = await container.getChildElement(12);
  var slide14 = await container.getChildElement(14);
  expect(Math.round(slide12.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide14.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .pressKey('left')
    .wait(speed1)
    .pressKey('left')
    .wait(speed1);

  slide10 = await container.getChildElement(10);
  slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

});
