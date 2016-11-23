import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `gutter`
  .page(address);

test('gutter: ', async t => {
  await t
    .resizeWindow(windowWidthes[1] + 20, windowHeight);

  var container = await select('#gutter');
  const innerWidth = await getWindowInnerWidth();
  const slide10 = await container.getChildElement(10);
  const slide11 = await container.getChildElement(11);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide11.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);
  expect(Math.round(slide11.boundingClientRect.left - slide10.boundingClientRect.right)).to.equal(gutter);
});

fixture `edgePadding`
  .page(address);

test('edgePadding: ', async t => {
  await t.resizeWindow(windowWidthes[2] + 100, windowHeight);

  var container = await select('#edgePadding');
  var innerWidth = await getWindowInnerWidth();
  var slide10 = await container.getChildElement(10);
  var slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(edgePadding);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth - edgePadding);

  await t.resizeWindow(windowWidthes[1] + 100, windowHeight);
    
  // get the children again to clean the cache
  var innerWidth = await getWindowInnerWidth();
  slide10 = await container.getChildElement(10);
  slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(edgePadding);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth - edgePadding);

});

fixture `edgePaddingGutter`
  .page(address);

test('edgePaddingGutter: ', async t => {
  await t.resizeWindow(windowWidthes[0] + 110, windowHeight);

  var container = await select('#edgePaddingGutter');
  var innerWidth = await getWindowInnerWidth();
  var slide10 = await container.getChildElement(10);
  var slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(edgePadding + gutter);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth - edgePadding - gutter);

  await t
    .resizeWindow(windowWidthes[2] + 110, windowHeight);
    
  // get the children again to clean the cache
  var innerWidth = await getWindowInnerWidth();
  slide10 = await container.getChildElement(10);
  slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(edgePadding + gutter);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth - edgePadding - gutter);

});
