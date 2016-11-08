import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { address, speed1, gutter, edgePadding, windowWidthes, windowHeight, select } from './setting.js';

fixture `rewind`
  .page(address);

test('rewind: init', async t => {
  await t;

  const prevBtn = await select('.rewind_wrapper [data-controls="prev"]');
  const nextBtn = await select('.rewind_wrapper [data-controls="next"]');
  // check the controls buttons
  expect(prevBtn.attributes.disabled).to.equal('');
  expect(prevBtn.attributes.tabIndex).to.equal('-1');
  expect(nextBtn.attributes.disabled).to.be.undefined;
  expect(nextBtn.attributes.tabIndex).to.equal('0');
});

test('rewind: click', async t => {
  await t
    .resizeWindow(windowWidthes[1], windowHeight)
    .click('.rewind_wrapper [data-controls="next"]');

  var prevBtn = await select('.rewind_wrapper [data-controls="prev"]');
  var nextBtn = await select('.rewind_wrapper [data-controls="next"]');
  var container = await select('#rewind');
  var slide1 = await container.getChildElement(1);
  var slide3 = await container.getChildElement(3);
  // check the controls buttons
  expect(prevBtn.attributes.disabled).to.be.undefined;
  expect(prevBtn.attributes.tabIndex).to.equal('0');
  // check the sliders
  expect(Math.round(slide1.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide3.boundingClientRect.right)).to.equal(windowWidthes[1]);

  await t
    .click('.rewind_wrapper [data-controls="next"]')
    .click('.rewind_wrapper [data-controls="next"]');

  prevBtn = await select('.rewind_wrapper [data-controls="prev"]');
  nextBtn = await select('.rewind_wrapper [data-controls="next"]');
  var slide0 = await container.getChildElement(0);
  var slide2 = await container.getChildElement(2);
  // check the controls buttons
  expect(prevBtn.attributes.disabled).to.equal('');
  expect(prevBtn.attributes.tabIndex).to.equal('-1');
  expect(nextBtn.attributes.disabled).to.be.undefined;
  expect(nextBtn.attributes.tabIndex).to.equal('0');
  // check the sliders
  expect(Math.round(slide0.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide2.boundingClientRect.right)).to.equal(windowWidthes[1]);

});
