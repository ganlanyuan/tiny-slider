import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, tabindex, select, getWindowInnerWidth } from './setting.js';

fixture `lazyload`
  .page(address);

test('lazyload: init', async t => {
  await t
    .resizeWindow(windowWidthes[1], windowHeight);

  for (var i = 9; i < 13; i++) {
    var img = await Selector('#lazyload img', { index: i })();
    expect(img.attributes['src']).to.equal(img.attributes['data-src']);
  }
});

test('lazyload: click', async t => {
  // controls click
  await t
    .click('.lazyload_wrapper [data-controls="next"]')
    .wait(speed1);

  var img = await Selector('#lazyload img', { index: 14 })();
  expect(img.attributes['src']).to.equal(img.attributes['data-src']);
  
  await t
    .click('.lazyload_wrapper [data-controls="next"]')
    .wait(speed1);

  img = await Selector('#lazyload img', { index: 15 })();
  expect(img.attributes['src']).to.equal(img.attributes['data-src']);

  // nav click
  await t
    .click('.lazyload_wrapper [data-nav="1"]')
    .wait(speed1);

  for (var i = 12; i < 16; i++) {
    var img = await Selector('#lazyload img', { index: i })();
    expect(img.attributes['src']).to.equal(img.attributes['data-src']);
  }

});
