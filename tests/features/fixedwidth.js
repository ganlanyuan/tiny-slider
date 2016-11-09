import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `fixedWidth`
  .page(address);

test('fixedWidth: ', async t => {
  await t
    .resizeWindow(1000, windowHeight);

  // check sliders position
  var innerWidth = await getWindowInnerWidth();
  var container = await select('#fixedWidth');
  var slide10 = await container.getChildElement(10);
  var slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(900);
  
  // click 11 times
  await t
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .click('.fixedWidth_wrapper [data-controls="next"]')
    .wait(speed1);

  var slide1 = await container.getChildElement(1);
  var slide3 = await container.getChildElement(3);
  expect(Math.round(slide1.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide3.boundingClientRect.right)).to.equal(900);

  await t
    .click('.fixedWidth_wrapper [data-controls="prev"]')
    .wait(speed1);

  var slide20 = await container.getChildElement(20);
  var slide22 = await container.getChildElement(22);
  expect(Math.round(slide20.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide22.boundingClientRect.right)).to.equal(900);

});
