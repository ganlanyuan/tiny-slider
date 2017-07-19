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
  const navContainer = Selector('#base_wrapper .tns-nav');

  const container = Selector('#base');
  await t
    .setTestSpeed(1);

  for(let i = 0; i < 6; i++) {
    await t
      .click(prevBtn)
      .wait(speed1);
  }

  await t
    .expect(navContainer.child((slideCount * multiplyer - items * 6)%slideCount).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains(((slideCount * multiplyer - items * 6)%slideCount).toString())
    ;

  for(let i = 0; i < 11; i++) {
    await t
      .click(nextBtn)
      .wait(speed1);
  }

  await t
    .expect(navContainer.child((slideCount * multiplyer - items * (6 - 11))%slideCount).getAttribute('aria-selected')).eql('true')
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

test('base: accessibility_init', async t => {
  const ua = await t.eval(() => navigator.userAgent);
  const tabindex = (ua.indexOf('MSIE 9.0') > -1 || ua.indexOf('MSIE 8.0') > -1) ? 'tabIndex' : 'tabindex';

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
    // .refresh()
    // check controls properties
    .expect(controlsContainer.getAttribute('aria-label')).eql('Carousel Navigation')
    .expect(prevBtn.getAttribute('aria-controls')).eql('base')
    .expect(nextBtn.getAttribute('aria-controls')).eql('base')
    .expect(controlsContainer.getAttribute(tabindex)).eql('0')
    .expect(prevBtn.getAttribute(tabindex)).eql('-1')
    .expect(nextBtn.getAttribute(tabindex)).eql('-1')
    // check nav properties
    .expect(navContainer.getAttribute('aria-label')).eql('Carousel Pagination')
    .expect(navContainer.child(0).getAttribute('aria-selected')).eql('true')
    .expect(navContainer.child(0).getAttribute('aria-controls')).eql('base-item0')
    .expect(navContainer.child(0).getAttribute(tabindex)).eql('0')
    .expect(navContainer.child(1).getAttribute('aria-selected')).eql('false')
    .expect(navContainer.child(1).getAttribute('aria-controls')).eql('base-item1')
    .expect(navContainer.child(1).getAttribute(tabindex)).eql('-1')
    // check slides
    .expect(firstVisibleSlide.getAttribute('aria-hidden')).eql('false')
    .expect(firstVisibleSlide.id).eql('base-item0')
    .expect(lastVisibleSlide.getAttribute('aria-hidden')).eql('false')
    .expect(firstVisibleSlidePrev.getAttribute('aria-hidden')).eql('true')
    .expect(firstVisibleSlidePrev.id).eql('')
    .expect(lastVisibleSlideNext.getAttribute('aria-hidden')).eql('true')
    ;
});

// controls keydown
test('base: accessibility_keydown_controls', async t => {
  const controlsContainer = Selector('#base_wrapper .tns-controls');
  const navContainer = Selector('#base_wrapper .tns-nav');
  const container = Selector('#base');

  await t
    .click(controlsContainer)
    .wait(speed1);

  for (let i = 0; i < 3; i++) {
    await t
      .pressKey('left')
      .wait(speed1);
  }

  await t
    .expect(navContainer.child((slideCount * multiplyer - items * 3)%slideCount).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains(((slideCount * multiplyer - items * 3)%slideCount).toString())
    ;

  for (let i = 0; i < 4; i++) {
    await t
      .pressKey('right')
      .wait(speed1);
  }

  await t
    .expect(navContainer.child((slideCount * multiplyer - items * (3 - 4))%slideCount).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains(((slideCount * multiplyer - items * (3 - 4))%slideCount).toString())
    ;
});

// nav keydown
test('base: accessibility_keydown_nav', async t => {
  const controlsContainer = Selector('#base_wrapper .tns-controls');
  const navContainer = Selector('#base_wrapper .tns-nav');
  const container = Selector('#base');

  await t
    .click(controlsContainer)
    .pressKey('tab')
    .pressKey('right')
    .pressKey('enter')
    // 1
    .expect(navContainer.child(3).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains((items).toString())
    .pressKey('right')
    .pressKey('enter')
    // 2
    .expect(navContainer.child(6).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains((items * 2).toString())
    .pressKey('left')
    .pressKey('enter')
    // 1
    .expect(navContainer.child(3).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains((items).toString())
    .pressKey('up')
    .pressKey('enter')
    // 1
    .expect(navContainer.child(0).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains('0')
    .pressKey('down')
    .pressKey('space')
    // 1
    .expect(navContainer.child(6).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains((slideCount - 1).toString())
    ;
});


fixture `non loop`
  .page(address);

test('non loop', async t => {
  const controlsContainer = Selector('#non-loop_wrapper .tns-controls');
  const prevBtn = controlsContainer.child(0);
  const nextBtn = controlsContainer.child(1);
  const navContainer = Selector('#non-loop_wrapper .tns-nav');
  const container = Selector('#non-loop');

  await t
    .expect(container.childElementCount).eql(slideCount)
    .expect(prevBtn.hasAttribute('disabled')).ok()
    .setTestSpeed(1);

  await t
    .click(nextBtn)
    .wait(speed1)
    .expect(prevBtn.hasAttribute('disabled')).notOk();

  for (let i = 0; i < 3; i++) {
    await t
      .click(nextBtn)
      .wait(speed1);
  }

  await t
    .expect(nextBtn.hasAttribute('disabled')).ok()
    .expect(navContainer.child(slideCount - items).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains((slideCount - items).toString())
    .click(nextBtn)
    .wait(speed1)
    // 5
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains((slideCount - items).toString())
    .click(prevBtn)
    .wait(speed1)
    // 1
    .expect(prevBtn.hasAttribute('disabled')).notOk()
    .expect(nextBtn.hasAttribute('disabled')).notOk()
    .expect(navContainer.child(slideCount - items - 1).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains((slideCount - items - 1).toString())
    ;
});

fixture `rewind`
  .page(address);

test('rewind', async t => {
  const controlsContainer = Selector('#rewind_wrapper .tns-controls');
  const prevBtn = controlsContainer.child(0);
  const nextBtn = controlsContainer.child(1);
  const navContainer = Selector('#rewind_wrapper .tns-nav');
  const container = Selector('#rewind');

  await t
    .expect(container.childElementCount).eql(slideCount)
    .expect(prevBtn.hasAttribute('disabled')).ok()
    .setTestSpeed(1)
    .click(nextBtn)
    .wait(speed1)
    .expect(prevBtn.hasAttribute('disabled')).notOk()
    ;

  for (let i = 0; i < 3; i++) {
    await t
      .click(nextBtn)
      .wait(speed1);
  }

  await t
    .expect(nextBtn.hasAttribute('disabled')).notOk()
    .expect(navContainer.child(slideCount - items).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains((slideCount - items).toString())
    ;

  for (let i = 0; i < 2; i++) {
    await t
      .click(nextBtn)
      .wait(speed1);
  }

  await t
    .expect(navContainer.child((items * 6 - 1)%(slideCount - items)).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains(((items * 6 - 1)%(slideCount - items)).toString())
    .click(prevBtn)
    .wait(speed1)
    .expect(prevBtn.hasAttribute('disabled')).ok()
    .expect(navContainer.child(0).getAttribute('aria-selected')).eql('true')
    .expect(container.child("[aria-hidden=false]").nth(0).find('div').textContent).contains('0')
    ;
});
