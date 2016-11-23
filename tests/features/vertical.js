import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `vertical`
  .page(address);

test('vertical: init', async t => {
  await t
    .resizeWindow(windowWidthes[1], windowHeight);

  var container = await select('#vertical');
  var parent = await container.getParentNode();
  expect(container.attributes['data-tns-role']).to.equal('content');
  expect(container.attributes['data-tns-mode']).to.equal('carousel');
  expect(container.attributes['data-tns-axis']).to.equal('vertical');
  expect(parent.attributes['data-tns-role']).to.equal('content-wrapper');
  expect(parent.attributes['data-tns-hidden']).to.equal('y');

  container = await select('#vertical');
  const slide10 = await container.getChildElement(10);
  const slide13 = await container.getChildElement(13);
  expect(Math.round(slide10.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top));
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom));

});

test('vertical: nav, controls click, resize', async t => {
  // next button click
  await t
    .click('.vertical_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.vertical_wrapper [data-controls="next"]')
    .wait(speed1);

  var container = await select('#vertical');
  var parent = await container.getParentNode();
  container = await select('#vertical');
  var slide12 = await container.getChildElement(12);
  var slide15 = await container.getChildElement(15);
  expect(Math.round(slide12.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top));
  expect(Math.round(slide15.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom));

  // prev button click
  await t
    .click('.vertical_wrapper [data-controls="prev"]')
    .wait(speed1);

  var container = await select('#vertical');
  parent = await container.getParentNode();
  container = await select('#vertical');
  var slide11 = await container.getChildElement(11);
  var slide14 = await container.getChildElement(14);
  expect(Math.round(slide11.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top));
  expect(Math.round(slide14.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom));

  // nav click
  await t
    .click('.vertical_wrapper [data-nav="1"]')
    .wait(speed1);

  var container = await select('#vertical');
  parent = await container.getParentNode();
  container = await select('#vertical');
  var slide13 = await container.getChildElement(13);
  var slide16 = await container.getChildElement(16);
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top));
  expect(Math.round(slide16.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom));

  // resize window
  await t
    .resizeWindow(windowWidthes[0], windowHeight)
    .resizeWindow(windowWidthes[1], windowHeight);

  var container = await select('#vertical');
  parent = await container.getParentNode();
  container = await select('#vertical');
  slide13 = await container.getChildElement(13);
  slide16 = await container.getChildElement(16);
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top));
  expect(Math.round(slide16.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom));

});

test('verticalGutter: init, resize', async t => {
  await t;

  var container = await select('#verticalGutter');
  var parent = await container.getParentNode();
  container = await select('#verticalGutter');
  var slide10 = await container.getChildElement(10);
  var slide13 = await container.getChildElement(13);
  expect(Math.round(slide10.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top));
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom));

  await t
    .resizeWindow(windowWidthes[2], windowHeight);

  container = await select('#verticalGutter');
  parent = await container.getParentNode();
  container = await select('#verticalGutter');
  slide10 = await container.getChildElement(10);
  slide13 = await container.getChildElement(13);
  expect(Math.round(slide10.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top));
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom));

});

test('verticalEdgepadding: init, resize', async t => {
  await t;

  var container = await select('#verticalEdgepadding');
  var parent = await container.getParentNode();
  container = await select('#verticalEdgepadding');
  var slide10 = await container.getChildElement(10);
  var slide13 = await container.getChildElement(13);
  expect(Math.round(slide10.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top + edgePadding));
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom - edgePadding));

  await t
    .resizeWindow(windowWidthes[2], windowHeight);

  container = await select('#verticalEdgepadding');
  parent = await container.getParentNode();
  container = await select('#verticalEdgepadding');
  slide10 = await container.getChildElement(10);
  slide13 = await container.getChildElement(13);
  expect(Math.round(slide10.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top + edgePadding));
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom - edgePadding));

});

test('verticalEdgepaddingGutter: init, resize', async t => {
  await t;

  var container = await select('#verticalEdgepaddingGutter');
  var parent = await container.getParentNode();
  container = await select('#verticalEdgepaddingGutter');
  var slide10 = await container.getChildElement(10);
  var slide13 = await container.getChildElement(13);
  expect(Math.round(slide10.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top + edgePadding + gutter));
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom - edgePadding));

  await t
    .resizeWindow(windowWidthes[2], windowHeight);

  container = await select('#verticalEdgepaddingGutter');
  parent = await container.getParentNode();
  container = await select('#verticalEdgepaddingGutter');
  slide10 = await container.getChildElement(10);
  slide13 = await container.getChildElement(13);
  expect(Math.round(slide10.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.top + edgePadding + gutter));
  expect(Math.round(slide13.boundingClientRect.top)).to.equal(Math.round(parent.boundingClientRect.bottom - edgePadding));

});
