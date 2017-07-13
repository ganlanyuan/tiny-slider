import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, items, slideCount, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `base`
  .page(address);

test('base: init', async t => {
  // await t
  //   .resizeWindow(windowWidthes[1], windowHeight);

  var container = await Selector('#base');
  const innerWrapper = await container.parent();
  const outerWrapper = await innerWrapper.parent();
  expect(outerWrapper.hasClass(['tns-outer', 'tns-hdx']));
  expect(innerWrapper.hasClass('tns-inner'));
  expect(container.hasClass(['base', 'tns-slider', 'tns-carousel', 'tns-subpixel', 'tns-calc tns-horizontal']));
  // console.log(container.childElementCount);
  // expect(container.childNodeCount).to.equal(slideCount * 5);

  container = await Selector('#base');
  const innerWidth = await getWindowInnerWidth();
  const slide0 = await container.child(0);
  const slide10 = await container.child(10);
  const slide12 = await container.child(12);
  // console.log(slide0.getAttribute('aria-hidden'));
  expect(slide0.getAttribute('aria-hidden')).to.equal('true');
  expect(slide10.getAttribute('aria-hidden')).to.equal('false');
  expect(slide12.getAttribute('aria-hidden')).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

  // const prevBtn = await select('.base_wrapper [data-controls="prev"]');
  // const nextBtn = await select('.base_wrapper [data-controls="next"]');
  // const controlsContainer = await prevBtn.getParentNode();
  // expect(controlsContainer.hasClass('tns-controls'));
  // expect(controlsContainer.attributes['aria-label']).to.equal('Carousel Navigation');
  // expect(prevBtn.attributes['aria-controls']).to.equal('base');
  // expect(prevBtn.attributes[tabindex]).to.equal('-1');
  // expect(nextBtn.attributes['aria-controls']).to.equal('base');
  // expect(nextBtn.attributes[tabindex]).to.equal('-1');

  // const nav0 = await select('.base_wrapper [data-nav="0"]');
  // const nav1 = await select('.base_wrapper [data-nav="1"]');
  // const nav2 = await select('.base_wrapper [data-nav="2"]');
  // const navContainer = await nav0.getParentNode();
  // expect(navContainer.hasClass('tns-nav'));
  // expect(navContainer.attributes['aria-label']).to.equal('Carousel Pagination');
  // expect(nav0.attributes['aria-selected']).to.equal('true');
  // expect(nav0.attributes[tabindex]).to.equal('0');
  // expect(nav1.attributes['aria-selected']).to.equal('false');
  // expect(nav1.attributes[tabindex]).to.equal('-1');
  // expect(nav2.visible).to.be.false;
});

// test('base: resize', async t => {
//   await t
//     .resizeWindow(windowWidthes[2], windowHeight);

//   const innerWidth = await getWindowInnerWidth();
//   const container = await select('#base');
//   const slide10 = await container.getChildElement(10);
//   const slide12 = await container.getChildElement(12);
//   expect(slide10.attributes['aria-hidden']).to.equal('false');
//   expect(slide12.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

// });

// test('base: nav click', async t => {
//   await t
//     .click('.base_wrapper [data-nav="1"]')
//     .wait(speed1);

//   var innerWidth = await getWindowInnerWidth();
//   var container = await select('#base');
//   const slide13 = await container.getChildElement(13);
//   const slide15 = await container.getChildElement(15);
//   expect(slide13.attributes['aria-hidden']).to.equal('false');
//   expect(slide15.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide13.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide15.boundingClientRect.right)).to.equal(innerWidth);
  
//   await t
//     .click('.base_wrapper [data-nav="0"]')
//     .wait(speed1);

//   const slide10 = await container.getChildElement(10);
//   const slide12 = await container.getChildElement(12);
//   expect(slide10.attributes['aria-hidden']).to.equal('false');
//   expect(slide12.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

// });

// test('base: controls click', async t => {
//   await t
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1);

//   var innerWidth = await getWindowInnerWidth();
//   var container = await select('#base');
//   const slide11 = await container.getChildElement(11);
//   const slide13 = await container.getChildElement(13);
//   expect(slide11.attributes['aria-hidden']).to.equal('false');
//   expect(slide13.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide11.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide13.boundingClientRect.right)).to.equal(innerWidth);
  
//   await t
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1);

//   const slide21 = await container.getChildElement(21);
//   const slide23 = await container.getChildElement(23);
//   expect(slide21.attributes['aria-hidden']).to.equal('false');
//   expect(slide23.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide21.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide23.boundingClientRect.right)).to.equal(innerWidth);

//   await t
//     .click('.base_wrapper [data-controls="next"]')
//     .wait(speed1);

//   const slide2 = await container.getChildElement(2);
//   const slide4 = await container.getChildElement(4);
//   expect(slide2.attributes['aria-hidden']).to.equal('false');
//   expect(slide4.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide2.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide4.boundingClientRect.right)).to.equal(innerWidth);

//   await t
//     .click('.base_wrapper [data-controls="prev"]')
//     .wait(speed1)
//     .click('.base_wrapper [data-controls="prev"]')
//     .wait(speed1);

//   expect(slide21.attributes['aria-hidden']).to.equal('false');
//   expect(slide23.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide21.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide23.boundingClientRect.right)).to.equal(innerWidth);

// });

// test('base: keys', async t => {
//   var focus = ClientFunction(() => {
//     document.querySelector('.base_wrapper [data-controls="next"]').focus();
//   });

//   await focus();
//   await t
//     .pressKey('left')
//     .pressKey('enter')
//     .wait(speed1);

//   var innerWidth = await getWindowInnerWidth();
//   var container = await select('#base');
//   const slide9 = await container.getChildElement(9);
//   const slide11 = await container.getChildElement(11);
//   expect(slide9.attributes['aria-hidden']).to.equal('false');
//   expect(slide11.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide9.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide11.boundingClientRect.right)).to.equal(innerWidth);
  
//   await t
//     .pressKey('right space')
//     .wait(speed1);

//   const slide10 = await container.getChildElement(10);
//   const slide12 = await container.getChildElement(12);
//   expect(slide10.attributes['aria-hidden']).to.equal('false');
//   expect(slide12.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

//   await t
//     .pressKey('tab')
//     .pressKey('right')
//     .pressKey('enter')
//     .wait(speed1);

//   const slide13 = await container.getChildElement(13);
//   const slide15 = await container.getChildElement(15);
//   expect(slide13.attributes['aria-hidden']).to.equal('false');
//   expect(slide15.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide13.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide15.boundingClientRect.right)).to.equal(innerWidth);
  
//   await t
//     .pressKey('left')
//     .pressKey('enter')
//     .wait(speed1);

//   expect(slide10.attributes['aria-hidden']).to.equal('false');
//   expect(slide12.attributes['aria-hidden']).to.equal('false');
//   expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
//   expect(Math.round(slide12.boundingClientRect.right)).to.equal(innerWidth);

// });
