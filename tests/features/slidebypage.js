import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `slideByPage`
  .page(address);

test('slideByPage: click next button', async t => {
  // click 1 time
  await t
    .resizeWindow(windowWidthes[1], windowHeight)
    .click('.slideByPage_wrapper [data-controls="next"]')
    .wait(speed1);

  // check sliders position
  var innerWidth = await getWindowInnerWidth();
  var container = await select('#slideByPage');
  var slide13 = await container.getChildElement(13);
  var slide15 = await container.getChildElement(15);
  expect(Math.round(slide13.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide15.boundingClientRect.right)).to.equal(innerWidth);
  
  // click 2 times
  await t
    .click('.slideByPage_wrapper [data-controls="next"]')
    .wait(speed1);

  var slide16 = await container.getChildElement(16);
  var slide18 = await container.getChildElement(18);
  expect(Math.round(slide16.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide18.boundingClientRect.right)).to.equal(innerWidth);

  // click 3 times
  await t
    .click('.slideByPage_wrapper [data-controls="next"]')
    .wait(speed1);

  var slide19 = await container.getChildElement(19);
  var slide21 = await container.getChildElement(21);
  expect(Math.round(slide19.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide21.boundingClientRect.right)).to.equal(innerWidth);

  // click 4 times
  await t
    .click('.slideByPage_wrapper [data-controls="next"]')
    .wait(speed1);

  var slide7 = await container.getChildElement(7);
  var slide9 = await container.getChildElement(9);
  expect(Math.round(slide7.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide9.boundingClientRect.right)).to.equal(innerWidth);

  // click 5 times
  await t
    .click('.slideByPage_wrapper [data-controls="next"]')
    .wait(speed1);

  var slide10 = await container.getChildElement(10);
  var slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

});

test('slideByPage: click prev button', async t => {
  // back to the original point
  await t
    .click('.slideByPage_wrapper [data-nav="0"]')
    .wait(speed1);

  // click 1 time
  await t
    .click('.slideByPage_wrapper [data-controls="prev"]')
    .wait(speed1);

  var innerWidth = await getWindowInnerWidth();
  var container = await select('#slideByPage');
  var slide7 = await container.getChildElement(7);
  var slide9 = await container.getChildElement(9);
  expect(Math.round(slide7.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide9.boundingClientRect.right)).to.equal(innerWidth);
  
  // click 2 times
  await t
    .click('.slideByPage_wrapper [data-controls="prev"]')
    .wait(speed1);

  var slide4 = await container.getChildElement(4);
  var slide6 = await container.getChildElement(6);
  expect(Math.round(slide4.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide6.boundingClientRect.right)).to.equal(innerWidth);

  // click 3 times
  await t
    .click('.slideByPage_wrapper [data-controls="prev"]')
    .wait(speed1);

  var slide16 = await container.getChildElement(16);
  var slide18 = await container.getChildElement(18);
  expect(Math.round(slide16.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide18.boundingClientRect.right)).to.equal(innerWidth);

  // click 4 times
  await t
    .click('.slideByPage_wrapper [data-controls="prev"]')
    .wait(speed1);

  var slide13 = await container.getChildElement(13);
  var slide15 = await container.getChildElement(15);
  expect(Math.round(slide13.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide15.boundingClientRect.right)).to.equal(innerWidth);

  // click 5 times
  await t
    .click('.slideByPage_wrapper [data-controls="prev"]')
    .wait(speed1);

  var slide10 = await container.getChildElement(10);
  var slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

});
