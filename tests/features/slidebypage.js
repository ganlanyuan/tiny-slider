import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `slideByPage`
  .page(address);

test('slideByPage: init', async t => {
  await t
    .resizeWindow(windowWidthes[1], windowHeight);

  // check sliders position
  var container = await select('#nonLoop');
  var parent = await container.getParentNode();
  container = await select('#nonLoop');
  var slide0 = await container.getChildElement(0);
  var slide2 = await container.getChildElement(2);
  expect(Math.round(slide0.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide2.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);
});
