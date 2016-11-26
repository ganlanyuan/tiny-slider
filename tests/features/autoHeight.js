import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `autoHeight`
  .page(address);

test('autoHeight: ', async t => {
  await t
    .resizeWindow(windowWidthes[1], windowHeight);

  // check sliders position
  var container = await select('#autoHeight');
  var slide10 = await container.getChildElement(10);
  expect(Math.round(container.offsetHeight)).to.equal(Math.round(slide10.offsetHeight));
  
  await t
    .click('.autoHeight_wrapper [data-controls="next"]')
    .wait(speed1 * 2);

  container = await select('#autoHeight');
  var slide11 = await container.getChildElement(11);
  expect(Math.round(container.offsetHeight)).to.equal(Math.round(slide11.offsetHeight));
  
  await t
    .click('.autoHeight_wrapper [data-controls="next"]')
    .wait(speed1 * 2);

  container = await select('#autoHeight');
  var slide12 = await container.getChildElement(12);
  expect(Math.round(container.offsetHeight)).to.equal(Math.round(slide12.offsetHeight));

  await t
    .click('.autoHeight_wrapper [data-controls="next"]')
    .wait(speed1 * 2);

  container = await select('#autoHeight');
  var slide13 = await container.getChildElement(13);
  expect(Math.round(container.offsetHeight)).to.equal(Math.round(slide13.offsetHeight));

});
