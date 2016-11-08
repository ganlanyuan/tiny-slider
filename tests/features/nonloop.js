import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, select } from './setting.js';

fixture `nonLoop`
  .page(address);

test('nonLoop: init', async t => {
  await t;
    // .resizeWindow(windowWidthes[1], windowHeight);

  const prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  const nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  // check controls
  expect(prevBtn.getAttribute('disabled')).to.equal('');
  expect(prevBtn.getAttribute('tabIndex')).to.equal('-1');
  expect(nextBtn.getAttribute('disabled')).to.be.undefined;
  expect(nextBtn.getAttribute('tabIndex')).to.equal('0');
  // check navs
  var nav0 = await select('.nonLoop_wrapper [data-slide="0"]');
  var nav1 = await select('.nonLoop_wrapper [data-slide="1"]');
  var nav2 = await select('.nonLoop_wrapper [data-slide="2"]');
  expect(nav2.visible).to.be.false;
  expect(nav0.getAttribute('aria-selected')).to.equal('true');
  expect(nav0.getAttribute('tabIndex')).to.equal('0');
  expect(nav1.getAttribute('aria-selected')).to.equal('false');
  expect(nav1.getAttribute('tabIndex')).to.equal('-1');
  // check sliders position
  var container = await select('#nonLoop');
  var slide0 = await container.getChildElement(0);
  var slide2 = await container.getChildElement(2);
  expect(Math.round(slide0.boundingClientRect.left)).to.equal(0);
  // expect(Math.round(slide2.boundingClientRect.right)).to.equal(windowWidthes[1]);
});

test('nonLoop: click', async t => {
  await t
    .click('.nonLoop_wrapper [data-controls="next"]');

  var prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  var nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  // check controls
  expect(prevBtn.getAttribute('disabled')).to.be.undefined;
  expect(prevBtn.getAttribute('tabIndex')).to.equal('0');
  // check sliders position
  var container = await select('#nonLoop');
  var slide1 = await container.getChildElement(1);
  var slide3 = await container.getChildElement(3);
  expect(Math.round(slide1.boundingClientRect.left)).to.equal(0);
  // expect(Math.round(slide3.boundingClientRect.right)).to.equal(windowWidthes[1]);

  await t
    .click('.nonLoop_wrapper [data-controls="next"]');

  prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  var slide2 = await container.getChildElement(2);
  var slide4 = await container.getChildElement(4);
  // check controls
  expect(prevBtn.getAttribute('disabled')).to.be.undefined;
  expect(prevBtn.getAttribute('tabIndex')).to.equal('0');
  expect(nextBtn.getAttribute('disabled')).to.equal('');
  expect(nextBtn.getAttribute('tabIndex')).to.equal('-1');
  // check navs
  var nav0 = await select('.nonLoop_wrapper [data-slide="0"]');
  var nav1 = await select('.nonLoop_wrapper [data-slide="1"]');
  expect(nav0.getAttribute('aria-selected')).to.equal('false');
  expect(nav0.getAttribute('tabIndex')).to.equal('-1');
  expect(nav1.getAttribute('aria-selected')).to.equal('true');
  expect(nav1.getAttribute('tabIndex')).to.equal('0');
  // check sliders
  expect(Math.round(slide2.boundingClientRect.left)).to.equal(0);
  // expect(Math.round(slide4.boundingClientRect.right)).to.equal(windowWidthes[1]);
});
