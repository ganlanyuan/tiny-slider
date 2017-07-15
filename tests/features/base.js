import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, items, slideCount, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth, absRound } from './setting.js';

fixture `base`
  .page(address);

test('base: init', async t => {
  const container = Selector('#base');
  const innerWrapper = container.parent();
  const outerWrapper = innerWrapper.parent();

  const controlsContainer = Selector('#base_wrapper .tns-controls');
  const prevBtn = controlsContainer.child(0);
  const nextBtn = controlsContainer.child(1);

  const navContainer = Selector('#base_wrapper .tns-nav');

  const firstVisibleSlide = container.child(slideCount * 2);
  const lastVisibleSlide = container.child(slideCount * 2 + items - 1);
  const firstVisibleSlidePrev = firstVisibleSlide.prevSibling(1);
  const lastVisibleSlideNext = lastVisibleSlide.nextSibling(1);
  const innerWidth = await getWindowInnerWidth();
  const itemWidth = await innerWidth / 3;

  await t
      // check outerWrapper classes
      .expect(outerWrapper.hasClass('tns-hdx')).ok()
      .expect(outerWrapper.hasClass('tns-outer')).ok()
      // check innerWrapper classes
      .expect(innerWrapper.hasClass('tns-inner')).ok()
      // check container classes
      .expect(container.hasClass('base')).ok()
      .expect(container.hasClass('tns-slider')).ok()
      .expect(container.hasClass('tns-carousel')).ok()
      .expect(container.hasClass('tns-horizontal')).ok()
      // check controls properties
      .expect(controlsContainer.getAttribute('aria-label')).eql('Carousel Navigation')
      .expect(prevBtn.getAttribute('aria-controls')).eql('base')
      .expect(nextBtn.getAttribute('aria-controls')).eql('base')
      .expect(controlsContainer.getAttribute('tabindex')).eql('0')
      .expect(prevBtn.getAttribute('tabindex')).eql('-1')
      .expect(nextBtn.getAttribute('tabindex')).eql('-1')
      // check nav properties
      .expect(navContainer.getAttribute('aria-label')).eql('Carousel Pagination')
      .expect(navContainer.child(0).getAttribute('aria-selected')).eql('true')
      .expect(navContainer.child(0).getAttribute('aria-controls')).eql('base-item0')
      .expect(navContainer.child(0).getAttribute('tabindex')).eql('0')
      .expect(navContainer.child(0).getAttribute('data-nav')).eql('0')
      .expect(navContainer.child(0).visible).ok()
      .expect(navContainer.child(1).getAttribute('aria-selected')).eql('false')
      .expect(navContainer.child(1).getAttribute('aria-controls')).eql('base-item1')
      .expect(navContainer.child(1).getAttribute('tabindex')).eql('-1')
      .expect(navContainer.child(1).getAttribute('data-nav')).eql('1')
      .expect(navContainer.child(1).visible).notOk()
      // check slides
      .expect(container.childElementCount).eql(slideCount * 5)
      .expect(firstVisibleSlide.getAttribute('aria-hidden')).eql('false')
      .expect(firstVisibleSlide.id).eql('base-item0')
      .expect(firstVisibleSlide.hasClass('tns-item')).ok()
      .expect(absRound(await firstVisibleSlide.getBoundingClientRectProperty('width'))).eql(await absRound(itemWidth))
      .expect(absRound(await firstVisibleSlide.getBoundingClientRectProperty('left'))).eql(0)
      .expect(lastVisibleSlide.getAttribute('aria-hidden')).eql('false')
      .expect(lastVisibleSlide.id).eql('base-item' + (items - 1).toString())
      .expect(lastVisibleSlide.hasClass('tns-item')).ok()
      .expect(absRound(await lastVisibleSlide.getBoundingClientRectProperty('right'))).eql(innerWidth)
      .expect(firstVisibleSlidePrev.getAttribute('aria-hidden')).eql('true')
      .expect(firstVisibleSlidePrev.id).eql('')
      .expect(firstVisibleSlidePrev.hasClass('tns-item')).ok()
      .expect(lastVisibleSlideNext.getAttribute('aria-hidden')).eql('true')
      .expect(lastVisibleSlideNext.hasClass('tns-item')).ok()
      ;
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
