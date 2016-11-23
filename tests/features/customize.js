import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `customize`
  .page(address);

test('customize: init', async t => {
  await t
    .resizeWindow(windowWidthes[1], windowHeight);

  // check autoplay button
  var autoplayButton = await select('.playbutton-wrapper > button');
  var autoplayButtonInner = await autoplayButton.getChildElement(0);
  expect(autoplayButton.attributes['data-action']).to.equal('stop');
  expect(autoplayButton.innerText).to.equal('stop');
  expect(autoplayButtonInner.innerText).to.equal('Stop Animation');

  // check controls
  var controlsContainer = await select('.customize_wrapper .controls');
  var prevButton = await controlsContainer.getChildElement(0);
  var nextButton = await controlsContainer.getChildElement(1);
  expect(controlsContainer.attributes['aria-label']).to.equal('Carousel Navigation');
  expect(prevButton.attributes['data-controls']).to.equal('prev');
  expect(prevButton.attributes['aria-controls']).to.equal('customize');
  expect(prevButton.attributes[tabindex]).to.equal('-1');
  expect(nextButton.attributes['data-controls']).to.equal('next');
  expect(nextButton.attributes['aria-controls']).to.equal('customize');
  expect(nextButton.attributes[tabindex]).to.equal('0');

  var navContainer = await select('.customize_wrapper .thumbnails');
  var nav0 = await navContainer.getChildElement(0);
  var nav1 = await navContainer.getChildElement(1);
  // const nav0 = await Selector('.customize_wrapper .thumbnails > li', { index: 0 })();
  // const nav1 = await Selector('.customize_wrapper .thumbnails > li', { index: 1 })();

  await t
    .click('.playbutton-wrapper > button')
    .click(nav0)
    .wait(speed1);

  // check nav
  expect(navContainer.attributes['aria-label']).to.equal('Carousel Pagination');
  expect(nav0.attributes['data-nav']).to.equal('0');
  expect(nav0.attributes['aria-selected']).to.equal('true');
  expect(nav0.attributes['aria-controls']).to.equal('customize-item0');
  expect(nav0.attributes[tabindex]).to.equal('0');
  expect(nav1.attributes['data-nav']).to.equal('1');
  expect(nav1.attributes['aria-selected']).to.equal('false');
  expect(nav1.attributes['aria-controls']).to.equal('customize-item1');
  expect(nav1.attributes[tabindex]).to.equal('-1');

  // check autoplay button
  autoplayButton = await select('.playbutton-wrapper > button');
  autoplayButtonInner = await autoplayButton.getChildElement(0);
  expect(autoplayButton.attributes['data-action']).to.equal('start');
  expect(autoplayButton.innerText).to.equal('start');
  expect(autoplayButtonInner.innerText).to.equal('Start Animation');

  // check slides
  const innerWidth = await getWindowInnerWidth();
  var container = await select('#customize');
  var slide10 = await container.getChildElement(10);
  var slide12 = await container.getChildElement(12);
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

});

test('customize: click', async t => {
  // check next button click
  await t
    .click('.customize_wrapper .controls .next')
    .wait(speed1)
    .click('.customize_wrapper .controls .next')
    .wait(speed1);

  const innerWidth = await getWindowInnerWidth();
  var container = await select('#customize');
  var slide12 = await container.getChildElement(12);
  var slide14 = await container.getChildElement(14);
  expect(Math.round(slide12.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide14.boundingClientRect.right)).to.equal(innerWidth);

  // check prev button click
  await t
    .click('.customize_wrapper .controls .prev')
    .wait(speed1);

  var slide11 = await container.getChildElement(11);
  var slide13 = await container.getChildElement(13);
  expect(Math.round(slide11.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide13.boundingClientRect.right)).to.equal(innerWidth);

  // check nav click
  const nav5 = await Selector('.customize_wrapper .thumbnails > li', { index: 4 })();
  await t
    .click(nav5)
    .wait(speed1);

  slide14 = await container.getChildElement(14);
  var slide16 = await container.getChildElement(16);
  expect(Math.round(slide14.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide16.boundingClientRect.right)).to.equal(innerWidth);

});
