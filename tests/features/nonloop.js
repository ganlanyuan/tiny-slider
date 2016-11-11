import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `nonLoop`
  .page(address);

test('nonLoop: init', async t => {
  await t
    .resizeWindow(windowWidthes[1], windowHeight);

  // check controls
  const prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  const nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  expect(prevBtn.attributes['disabled']).to.equal('');
  expect(prevBtn.attributes[tabindex]).to.equal('-1');
  expect(nextBtn.attributes['disabled']).to.be.undefined;
  expect(nextBtn.attributes[tabindex]).to.equal('0');
  // check navs
  var nav0 = await select('.nonLoop_wrapper [data-nav="0"]');
  var nav1 = await select('.nonLoop_wrapper [data-nav="1"]');
  var nav2 = await select('.nonLoop_wrapper [data-nav="2"]');
  expect(nav2.visible).to.be.false;
  expect(nav0.attributes['aria-selected']).to.equal('true');
  expect(nav0.attributes[tabindex]).to.equal('0');
  expect(nav1.attributes['aria-selected']).to.equal('false');
  expect(nav1.attributes[tabindex]).to.equal('-1');
  // check sliders position
  const innerWidth = await getWindowInnerWidth();
  const container = await select('#nonLoop');
  var slide0 = await container.getChildElement(0);
  var slide2 = await container.getChildElement(2);
  expect(Math.round(slide0.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide2.boundingClientRect.right)).to.equal(innerWidth);
});

test('nonLoop: click', async t => {
  await t
    .click('.nonLoop_wrapper [data-controls="next"]')
    .wait(speed1);

  // check controls
  var prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  var nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  expect(prevBtn.attributes['disabled']).to.be.undefined;
  expect(prevBtn.attributes[tabindex]).to.equal('0');
  // check sliders position
  var container = await select('#nonLoop');
  var innerWidth = await getWindowInnerWidth();
  var slide1 = await container.getChildElement(1);
  var slide3 = await container.getChildElement(3);
  expect(Math.round(slide1.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide3.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .click('.nonLoop_wrapper [data-controls="next"]')
    .wait(speed1);

  // check controls
  prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  expect(prevBtn.attributes['disabled']).to.be.undefined;
  expect(prevBtn.attributes[tabindex]).to.equal('0');
  expect(nextBtn.attributes['disabled']).to.equal('');
  expect(nextBtn.attributes[tabindex]).to.equal('-1');
  // check navs
  var nav0 = await select('.nonLoop_wrapper [data-nav="0"]');
  var nav1 = await select('.nonLoop_wrapper [data-nav="1"]');
  expect(nav0.attributes['aria-selected']).to.equal('false');
  expect(nav0.attributes[tabindex]).to.equal('-1');
  expect(nav1.attributes['aria-selected']).to.equal('true');
  expect(nav1.attributes[tabindex]).to.equal('0');
  // check sliders
  innerWidth = await getWindowInnerWidth();
  var slide2 = await container.getChildElement(2);
  var slide4 = await container.getChildElement(4);
  expect(Math.round(slide2.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide4.boundingClientRect.right)).to.equal(innerWidth);
});
