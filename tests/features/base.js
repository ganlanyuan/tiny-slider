import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, items, slideCount, edgePadding, windowWidthes, windowHeight, multiplyer, tabindex, select, getWindowInnerWidth, absRound } from './setting.js';

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
    // check nav properties
    .expect(navContainer.child(0).getAttribute('data-nav')).eql('0')
    .expect(navContainer.child(0).visible).ok()
    .expect(navContainer.child(1).getAttribute('data-nav')).eql('1')
    .expect(navContainer.child(1).visible).notOk()
    // check slides
    .expect(container.childElementCount).eql(slideCount * 5)
    .expect(firstVisibleSlide.hasClass('tns-item')).ok()
    .expect(absRound(await firstVisibleSlide.getBoundingClientRectProperty('width'))).eql(await absRound(itemWidth))
    .expect(absRound(await firstVisibleSlide.getBoundingClientRectProperty('left'))).eql(0)
    .expect(lastVisibleSlide.hasClass('tns-item')).ok()
    .expect(absRound(await lastVisibleSlide.getBoundingClientRectProperty('right'))).eql(innerWidth)
    .expect(firstVisibleSlidePrev.hasClass('tns-item')).ok()
    .expect(lastVisibleSlideNext.hasClass('tns-item')).ok()
    ;
});

test('base: controls click', async t => {
  const controlsContainer = Selector('#base_wrapper .tns-controls');
  const prevBtn = controlsContainer.child(0);
  const nextBtn = controlsContainer.child(1);

  const container = Selector('#base');
  await t
    .setTestSpeed(1)
    .click(prevBtn)
    .wait(speed1)
    // 1
    .click(prevBtn)
    .wait(speed1)
    // 2
    .click(prevBtn)
    .wait(speed1)
    // 3
    .click(prevBtn)
    .wait(speed1)
    // 4
    .click(prevBtn)
    .wait(speed1)
    // 5
    .click(prevBtn)
    .wait(speed1)
    // 6
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains(((slideCount * multiplyer - items * 6)%slideCount).toString())
    .click(nextBtn)
    .wait(speed1)
    // 1
    .click(nextBtn)
    .wait(speed1)
    // 2
    .click(nextBtn)
    .wait(speed1)
    // 3
    .click(nextBtn)
    .wait(speed1)
    // 4
    .click(nextBtn)
    .wait(speed1)
    // 5
    .click(nextBtn)
    .wait(speed1)
    // 6
    .click(nextBtn)
    .wait(speed1)
    // 7
    .click(nextBtn)
    .wait(speed1)
    // 8
    .click(nextBtn)
    .wait(speed1)
    // 9
    .click(nextBtn)
    .wait(speed1)
    // 10
    .click(nextBtn)
    .wait(speed1)
    // 11
    .expect(container.child('[aria-hidden=false]').nth(0).find('div').textContent).contains(((slideCount * multiplyer - items * (6 - 11))%slideCount).toString())
    ;
});

test('base: nav click', async t => {
  const container = Selector('#base');
  const navContainer = Selector('#base_wrapper .tns-nav');

  await t
    // 3
    .click(navContainer.child(3))
    .wait(speed1)
    .expect(navContainer.child(3).getAttribute('aria-selected')).eql('true')
    .expect(container.child('[aria-hidden=false]').nth(0).find('div').textContent).contains(3)
    // 6
    .click(navContainer.child(6))
    .wait(speed1)
    .expect(navContainer.child(6).getAttribute('aria-selected')).eql('true')
    .expect(container.child('[aria-hidden=false]').nth(0).find('div').textContent).contains(6)
    // 0
    .click(navContainer.child(0))
    .wait(speed1)
    .expect(navContainer.child(0).getAttribute('aria-selected')).eql('true')
    .expect(container.child('[aria-hidden=false]').nth(0).find('div').textContent).contains(0)
    ;
});

test('base: accessibility', async t => {
  const controlsContainer = Selector('#base_wrapper .tns-controls');
  const prevBtn = controlsContainer.child(0);
  const nextBtn = controlsContainer.child(1);

  const navContainer = Selector('#base_wrapper .tns-nav');

  const container = Selector('#base');
  const firstVisibleSlide = container.child(slideCount * 2);
  const lastVisibleSlide = container.child(slideCount * 2 + items - 1);
  const firstVisibleSlidePrev = firstVisibleSlide.prevSibling(1);
  const lastVisibleSlideNext = lastVisibleSlide.nextSibling(1);

  await t
    // check controls properties
    .expect(controlsContainer.getAttribute('aria-label')).eql('Carousel Navigation')
    .expect(prevBtn.getAttribute('aria-controls')).eql('base')
    .expect(nextBtn.getAttribute('aria-controls')).eql('base')
    .expect(await controlsContainer.getAttribute('tabindex') || await controlsContainer.getAttribute('tabIndex')).eql('0')
    // .expect(prevBtn.getAttribute('tabindex')).eql('-1')
    // .expect(nextBtn.getAttribute('tabindex')).eql('-1')
    // check nav properties
    .expect(navContainer.getAttribute('aria-label')).eql('Carousel Pagination')
    .expect(navContainer.child(0).getAttribute('aria-selected')).eql('true')
    .expect(navContainer.child(0).getAttribute('aria-controls')).eql('base-item0')
    // .expect(navContainer.child(0).getAttribute('tabindex')).eql('0')
    .expect(navContainer.child(1).getAttribute('aria-selected')).eql('false')
    .expect(navContainer.child(1).getAttribute('aria-controls')).eql('base-item1')
    // .expect(navContainer.child(1).getAttribute('tabindex')).eql('-1')
    // check slides
    .expect(firstVisibleSlide.getAttribute('aria-hidden')).eql('false')
    .expect(firstVisibleSlide.id).eql('base-item0')
    .expect(lastVisibleSlide.getAttribute('aria-hidden')).eql('false')
    .expect(firstVisibleSlidePrev.getAttribute('aria-hidden')).eql('true')
    .expect(firstVisibleSlidePrev.id).eql('')
    .expect(lastVisibleSlideNext.getAttribute('aria-hidden')).eql('true')
    ;
});