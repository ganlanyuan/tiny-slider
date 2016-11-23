import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `autoplay`
  .page(address);

test('autoplay: run', async t => {
  // ** check autoplay function **
  // 1. stop, reset and start again
  // 2. wait for 1 slide time
  await t
    .resizeWindow(windowWidthes[1], windowHeight)
    .click('.autoplay_wrapper [data-action]')
    .click('.autoplay_wrapper [data-nav="0"]')
    .click('.autoplay_wrapper [data-action]')
    .wait(speed1 * 10);

  // check sliders position
  var innerWidth = await getWindowInnerWidth();
  var title = await select('.autoplay_wrapper h2');
  var container = await select('#autoplay');
  var slide11 = await container.getChildElement(11);
  var slide13 = await container.getChildElement(13);
  expect(Math.round(slide11.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide13.boundingClientRect.right)).to.equal(innerWidth);
  // check button
  var autoplayButton = await select('.autoplay_wrapper [data-action]');
  expect(autoplayButton.attributes['data-action']).to.equal('stop');

  // ** check hover on running **
  // 1. mouseover
  // 2. wait for 2 slide time
  // 3. mouseout
  // 4. wait for 1 slide time
  await t
    .hover(slide13)
    .wait(speed1 * 20)
    .hover(title)
    .wait(speed1 * 10);

  var slide12 = await container.getChildElement(12);
  var slide14 = await container.getChildElement(14);
  expect(Math.round(slide12.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide14.boundingClientRect.right)).to.equal(innerWidth);

  // ** check stop action **
  // 1. stop
  // 2. wait for 1 slide time
  await t
    .click('.autoplay_wrapper [data-action]')
    .wait(speed1 * 10);

  slide12 = await container.getChildElement(12);
  slide14 = await container.getChildElement(14);
  expect(Math.round(slide12.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide14.boundingClientRect.right)).to.equal(innerWidth);
  // check button
  autoplayButton = await select('.autoplay_wrapper [data-action]');
  expect(autoplayButton.attributes['data-action']).to.equal('start');

  // ** check hover on pause **
  // 1. mouseover
  // 2. wait for 1 slide time
  // 3. mouseout
  // 4. wait for 1 slide time
  await t
    .hover(slide13)
    .wait(speed1 * 10)
    .hover(title)
    .wait(speed1 * 10);

  slide12 = await container.getChildElement(12);
  slide14 = await container.getChildElement(14);
  expect(Math.round(slide12.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide14.boundingClientRect.right)).to.equal(innerWidth);

});
