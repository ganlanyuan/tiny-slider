import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `animation`
  .page(address);

test('animation: init, resize', async t => {
  await t.resizeWindow(windowWidthes[1], windowHeight);

  // check container
  var container = await select('#animation');
  var parent = await container.getParentNode();
  expect(container.attributes['data-tns-role']).to.equal('content');
  expect(container.attributes['data-tns-mode']).to.equal('gallery');
  expect(container.attributes['data-tns-axis']).to.equal('horizontal');
  expect(parent.attributes['data-tns-role']).to.equal('content-wrapper');

  // check slide
  var innerWidth = await getWindowInnerWidth();
  container = await select('#animation');
  const slide0 = await container.getChildElement(0);
  var slide2 = await container.getChildElement(2);
  const slide3 = await container.getChildElement(3);
  expect(slide0.hasClass('jello')).to.be.true;
  expect(slide2.hasClass('jello')).to.be.true;
  expect(slide3.hasClass('jello')).to.be.false;
  expect(Math.round(slide0.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide2.boundingClientRect.right)).to.equal(innerWidth);

  await t
    .resizeWindow(windowWidthes[2], windowHeight);

  innerWidth = await getWindowInnerWidth();
  container = await select('#animation');
  slide2 = await container.getChildElement(2);
  expect(Math.round(slide2.boundingClientRect.right)).to.equal(innerWidth);

});

test('animation: controls click', async t => {
  var innerWidth = await getWindowInnerWidth();

  // prev button click once
  await t
    .click('.animation_wrapper [data-controls="next"]');

  for (let i = 0; i < 3; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.false;
    expect(slide.hasClass('rollOut')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1) / 3));
  }

  for (let i = 3; i < 6; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 3) / 3));
  }

  await t
    .wait(speed1 * 13);

  for (let i = 0; i < 3; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('rollOut')).to.be.false;
    expect(Math.round(slide.boundingClientRect.left)).to.equal(0);
  }

  // prev button click twice
  await t
    .click('.animation_wrapper [data-controls="next"]');

  for (let i = 3; i < 6; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.false;
    expect(slide.hasClass('rollOut')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 3) / 3));
  }

  for (let i = 6; i < 9; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 6) / 3));
  }

  await t
    .wait(speed1 * 13);

  for (let i = 3; i < 6; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('rollOut')).to.be.false;
    expect(Math.round(slide.boundingClientRect.left)).to.equal(0);
  }

  // prev button click third
  await t
    .click('.animation_wrapper [data-controls="next"]');

  for (let i = 6; i < 9; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.false;
    expect(slide.hasClass('rollOut')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 6) / 3));
  }

  for (let i = 9; i < 12; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 9) / 3));
  }

  await t
    .wait(speed1 * 13);

  for (let i = 6; i < 9; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('rollOut')).to.be.false;
    expect(Math.round(slide.boundingClientRect.left)).to.equal(0);
  }

  // prev button click once
  await t
    .click('.animation_wrapper [data-controls="prev"]');

  for (let i = 9; i < 12; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.false;
    expect(slide.hasClass('rollOut')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 9) / 3));
  }

  for (let i = 6; i < 9; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 6) / 3));
  }

  await t
    .wait(speed1 * 13);

  for (let i = 9; i < 12; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('rollOut')).to.be.false;
    expect(Math.round(slide.boundingClientRect.left)).to.equal(0);
  }

  // nav1 click
  await t
    .click('.animation_wrapper [data-nav="1"]');

  for (let i = 6; i < 9; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.false;
    expect(slide.hasClass('rollOut')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 6) / 3));
  }

  for (let i = 3; i < 6; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 3) / 3));
  }

  await t
    .wait(speed1 * 13);

  for (let i = 6; i < 9; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('rollOut')).to.be.false;
    expect(Math.round(slide.boundingClientRect.left)).to.equal(0);
  }

  // nav1 click twice
  await t
    .click('.animation_wrapper [data-nav="1"]')
    .wait(speed1 * 13);

  for (let i = 3; i < 6; i++) {
    let slide = await Selector('#animation > div', { index: i })();
    expect(slide.hasClass('jello')).to.be.true;
    expect(Math.round(slide.boundingClientRect.right)).to.equal(Math.round(innerWidth * (i + 1 - 3) / 3));
  }

});