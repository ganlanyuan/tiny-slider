import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `base`
  .page(address);

test('base: init', async t => {
  await t;

  var container = await select('#base');
  const parent = await container.getParentNode();
  const grandParent = await parent.getParentNode();
  expect(grandParent.attributes['data-tns-role']).to.equal('wrapper');
  expect(grandParent.attributes['data-tns-hidden']).to.equal('x');
  expect(parent.attributes['data-tns-role']).to.equal('content-wrapper');
  expect(container.attributes['data-tns-role']).to.equal('content');
  expect(container.attributes['data-tns-mode']).to.equal('carousel');
  expect(container.attributes['data-tns-features']).to.equal('horizontal');
  expect(container.childElementCount).to.equal(25);

  container = await select('#base');
  const innerWidth = await getWindowInnerWidth();
  const slide0 = await container.getChildElement(0);
  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide0.attributes['aria-hidden']).to.equal('true');
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

  const prevBtn = await select('.base_wrapper [data-controls="prev"]');
  const nextBtn = await select('.base_wrapper [data-controls="next"]');
  const controlsContainer = await prevBtn.getParentNode();
  expect(prevBtn.attributes['aria-controls']).to.equal('base');
  expect(prevBtn.attributes[tabindex]).to.equal('-1');
  expect(nextBtn.attributes['aria-controls']).to.equal('base');
  expect(nextBtn.attributes[tabindex]).to.equal('0');
  expect(controlsContainer.attributes['data-tns-role']).to.equal('controls');
  expect(controlsContainer.attributes['aria-label']).to.equal('Carousel Navigation');

  const nav0 = await select('.base_wrapper [data-slide="0"]');
  const nav1 = await select('.base_wrapper [data-slide="1"]');
  const nav2 = await select('.base_wrapper [data-slide="2"]');
  const navContainer = await nav0.getParentNode();
  expect(nav0.attributes['aria-selected']).to.equal('true');
  expect(nav0.attributes[tabindex]).to.equal('0');
  expect(nav1.attributes['aria-selected']).to.equal('false');
  expect(nav1.attributes[tabindex]).to.equal('-1');
  expect(nav2.visible).to.be.false;
  expect(navContainer.attributes['data-tns-role']).to.equal('nav');
  expect(navContainer.attributes['aria-label']).to.equal('Carousel Pagination');
});

test('base: resize', async t => {
  await t
    .resizeWindow(windowWidthes[2], windowHeight);

  const innerWidth = await getWindowInnerWidth();
  const container = await select('#base');
  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

});

test('base: nav click', async t => {
  await t
    .click('.base_wrapper [data-slide="1"]')
    .wait(speed1);

  var innerWidth = await getWindowInnerWidth();
  var container = await select('#base');
  const slide13 = await container.getChildElement(13);
  const slide15 = await container.getChildElement(15);
  expect(slide13.attributes['aria-hidden']).to.equal('false');
  expect(slide15.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide13.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide15.boundingClientRect.right)).to.equal(innerWidth);
  
  await t
    .click('.base_wrapper [data-slide="0"]')
    .wait(speed1);

  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

});

test('base: controls click', async t => {
  await t
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1);

  var innerWidth = await getWindowInnerWidth();
  var container = await select('#base');
  const slide11 = await container.getChildElement(11);
  const slide13 = await container.getChildElement(13);
  expect(slide11.attributes['aria-hidden']).to.equal('false');
  expect(slide13.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide11.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide13.boundingClientRect.right)).to.equal(innerWidth);
  
  await t
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1);

  const slide21 = await container.getChildElement(21);
  const slide23 = await container.getChildElement(23);
  expect(slide21.attributes['aria-hidden']).to.equal('false');
  expect(slide23.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide21.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide23.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1);

  const slide2 = await container.getChildElement(2);
  const slide4 = await container.getChildElement(4);
  expect(slide2.attributes['aria-hidden']).to.equal('false');
  expect(slide4.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide2.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide4.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .click('.base_wrapper [data-controls="prev"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="prev"]')
    .wait(speed1);

  expect(slide21.attributes['aria-hidden']).to.equal('false');
  expect(slide23.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide21.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide23.boundingClientRect.right)).to.equal(innerWidth);

});

test('base: keys', async t => {
  var focus = ClientFunction(() => {
    document.querySelector('.base_wrapper [data-controls="next"]').focus();
  });

  await focus();
  await t
    .pressKey('left')
    .pressKey('enter')
    .wait(speed1);

  var innerWidth = await getWindowInnerWidth();
  var container = await select('#base');
  const slide9 = await container.getChildElement(9);
  const slide11 = await container.getChildElement(11);
  expect(slide9.attributes['aria-hidden']).to.equal('false');
  expect(slide11.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide9.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide11.boundingClientRect.right)).to.equal(innerWidth);
  
  await t
    .pressKey('right space')
    .wait(speed1);

  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .pressKey('tab')
    .pressKey('right')
    .pressKey('enter')
    .wait(speed1);

  const slide13 = await container.getChildElement(13);
  const slide15 = await container.getChildElement(15);
  expect(slide13.attributes['aria-hidden']).to.equal('false');
  expect(slide15.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide13.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide15.boundingClientRect.right)).to.equal(innerWidth);
  
  await t
    .pressKey('left')
    .pressKey('enter')
    .wait(speed1);

  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

});
