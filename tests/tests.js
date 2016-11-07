import { expect } from 'chai';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

const select = Selector(id => document.querySelector(`${id}`));
// const address = 'http://172.20.20.20:3000/tests/index.html';
const address = 'http://192.168.103.82:3000/tests/index.html';
const speed1 = 100;
const gutter = 10;
const edgePadding = 50;

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
  const slide0 = await container.getChildElement(0);
  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide0.attributes['aria-hidden']).to.equal('true');
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

  const prevBtn = await select('.base_wrapper [data-controls="prev"]');
  const nextBtn = await select('.base_wrapper [data-controls="next"]');
  const controlsContainer = await prevBtn.getParentNode();
  expect(prevBtn.attributes['aria-controls']).to.equal('base');
  expect(prevBtn.attributes['tabindex']).to.equal('-1');
  expect(nextBtn.attributes['aria-controls']).to.equal('base');
  expect(nextBtn.attributes['tabindex']).to.equal('0');
  expect(controlsContainer.attributes['data-tns-role']).to.equal('controls');
  expect(controlsContainer.attributes['aria-label']).to.equal('Carousel Navigation');

  const nav0 = await select('.base_wrapper [data-slide="0"]');
  const nav1 = await select('.base_wrapper [data-slide="1"]');
  const nav2 = await select('.base_wrapper [data-slide="2"]');
  const navContainer = await nav0.getParentNode();
  expect(nav0.attributes['aria-selected']).to.equal('true');
  expect(nav0.attributes['tabindex']).to.equal('0');
  expect(nav1.attributes['aria-selected']).to.equal('false');
  expect(nav1.attributes['tabindex']).to.equal('-1');
  expect(nav2.visible).to.be.false;
  expect(navContainer.attributes['data-tns-role']).to.equal('nav');
  expect(navContainer.attributes['aria-label']).to.equal('Carousel Pagination');
});

test('base: resize', async t => {
  var container = await select('#base');
  const parent = await container.getParentNode();

  container = await select('#base');
  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);

  await t
    .resizeWindow(900, 900)
    .resizeWindow(1200, 900);

  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

});

test('base: nav click', async t => {
  await t;

  var container = await select('#base');
  const parent = await container.getParentNode();

  await t
    .click('.base_wrapper [data-slide="1"]')
    .wait(speed1);

  container = await select('#base');
  const slide13 = await container.getChildElement(13);
  const slide15 = await container.getChildElement(15);
  expect(slide13.attributes['aria-hidden']).to.equal('false');
  expect(slide15.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide13.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  container = await select('#base');
  expect(Math.round(slide15.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);
  
  await t
    .click('.base_wrapper [data-slide="0"]')
    .wait(speed1);

  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

});

test('base: controls click', async t => {
  await t;

  var container = await select('#base');
  const parent = await container.getParentNode();

  await t
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1);

  container = await select('#base');
  const slide11 = await container.getChildElement(11);
  const slide13 = await container.getChildElement(13);
  expect(slide11.attributes['aria-hidden']).to.equal('false');
  expect(slide13.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide11.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide13.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);
  
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
  expect(Math.round(slide21.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide23.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

  await t
    .click('.base_wrapper [data-controls="next"]')
    .wait(speed1);

  const slide2 = await container.getChildElement(2);
  const slide4 = await container.getChildElement(4);
  expect(slide2.attributes['aria-hidden']).to.equal('false');
  expect(slide4.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide2.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide4.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

  await t
    .click('.base_wrapper [data-controls="prev"]')
    .wait(speed1)
    .click('.base_wrapper [data-controls="prev"]')
    .wait(speed1);

  expect(slide21.attributes['aria-hidden']).to.equal('false');
  expect(slide23.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide21.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide23.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

});

test('base: keys', async t => {
  var container = await select('#base');
  const parent = await container.getParentNode();
  const nav0 = await select('.base_wrapper [data-slide="0"]');
  const nav1 = await select('.base_wrapper [data-slide="1"]');

  var focus = ClientFunction(() => {
    document.querySelector('.base_wrapper [data-controls="next"]').focus();
  });

  await focus();
  await t
    .pressKey('left')
    .pressKey('enter')
    .wait(speed1);

  container = await select('#base');
  const slide9 = await container.getChildElement(9);
  const slide11 = await container.getChildElement(11);
  expect(slide9.attributes['aria-hidden']).to.equal('false');
  expect(slide11.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide9.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide11.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);
  
  await t
    .pressKey('right space')
    .wait(speed1);

  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

  await t
    .pressKey('tab')
    .pressKey('right')
    .pressKey('enter')
    .wait(speed1);

  const slide13 = await container.getChildElement(13);
  const slide15 = await container.getChildElement(15);
  expect(slide13.attributes['aria-hidden']).to.equal('false');
  expect(slide15.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide13.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide15.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);
  
  await t
    .pressKey('left')
    .pressKey('enter')
    .wait(speed1);

  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(parent.boundingClientRect.left);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

});

fixture `gutter`
  .page(address);

test('gutter: ', async t => {
  await t;

  var container = await select('#gutter');
  const parent = await container.getParentNode();
  container = await select('#gutter');
  const slide10 = await container.getChildElement(10);
  const slide11 = await container.getChildElement(11);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide11.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(0);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(Math.round(parent.boundingClientRect.right));
  expect(Math.round(slide10.boundingClientRect.right + gutter)).to.equal(Math.round(slide11.boundingClientRect.left));
});

fixture `edgePadding`
  .page(address);

test('edgePadding: ', async t => {
  await t;

  var container = await select('#edgePadding');
  const parent = await container.getParentNode();

  container = await select('#edgePadding');
  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(edgePadding);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

  await t
    .resizeWindow(600, 400)
    .resizeWindow(900, 800);
    
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(edgePadding);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

});

fixture `edgePaddingGutter`
  .page(address);

test('edgePaddingGutter: ', async t => {
  await t;

  var container = await select('#edgePaddingGutter');
  const parent = await container.getParentNode();
  container = await select('#edgePaddingGutter');
  const slide10 = await container.getChildElement(10);
  const slide12 = await container.getChildElement(12);
  expect(slide10.attributes['aria-hidden']).to.equal('false');
  expect(slide12.attributes['aria-hidden']).to.equal('false');
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(edgePadding + gutter);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

  await t
    .resizeWindow(600, 400)
    .resizeWindow(900, 800);
    
  expect(Math.round(slide10.boundingClientRect.left)).to.equal(edgePadding + gutter);
  expect(Math.round(slide12.boundingClientRect.right)).to.equal(parent.boundingClientRect.right);

});

fixture `nonLoop`
  .page(address);

test('nonLoop: init', async t => {
  await t;

  const prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  const nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  expect(prevBtn.attributes.disabled).to.equal('');
  expect(prevBtn.attributes.tabindex).to.equal('-1');
  expect(nextBtn.attributes.disabled).to.be.undefined;
  expect(nextBtn.attributes.tabindex).to.equal('0');
});

test('nonLoop: click', async t => {
  await t
    .click('.nonLoop_wrapper [data-controls="next"]');

  var prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  var nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  expect(prevBtn.attributes.disabled).to.be.undefined;
  expect(prevBtn.attributes.tabindex).to.equal('0');

  await t
    .click('.nonLoop_wrapper [data-controls="next"]');

  prevBtn = await select('.nonLoop_wrapper [data-controls="prev"]');
  nextBtn = await select('.nonLoop_wrapper [data-controls="next"]');
  expect(prevBtn.attributes.disabled).to.be.undefined;
  expect(prevBtn.attributes.tabindex).to.equal('0');
  expect(nextBtn.attributes.disabled).to.equal('');
  expect(nextBtn.attributes.tabindex).to.equal('-1');
});

test('rewind: init', async t => {
  await t;

  const prevBtn = await select('.rewind_wrapper [data-controls="prev"]');
  const nextBtn = await select('.rewind_wrapper [data-controls="next"]');
  expect(prevBtn.attributes.disabled).to.equal('');
  expect(prevBtn.attributes.tabindex).to.equal('-1');
  expect(nextBtn.attributes.disabled).to.be.undefined;
  expect(nextBtn.attributes.tabindex).to.equal('0');
});

test('rewind: click', async t => {
  await t
    .click('.rewind_wrapper [data-controls="next"]');

  var prevBtn = await select('.rewind_wrapper [data-controls="prev"]');
  var nextBtn = await select('.rewind_wrapper [data-controls="next"]');
  expect(prevBtn.attributes.disabled).to.be.undefined;
  expect(prevBtn.attributes.tabindex).to.equal('0');

  await t
    .click('.rewind_wrapper [data-controls="next"]')
    .click('.rewind_wrapper [data-controls="next"]');

  prevBtn = await select('.rewind_wrapper [data-controls="prev"]');
  nextBtn = await select('.rewind_wrapper [data-controls="next"]');
  expect(prevBtn.attributes.disabled).to.equal('');
  expect(prevBtn.attributes.tabindex).to.equal('-1');
  expect(nextBtn.attributes.disabled).to.be.undefined;
  expect(nextBtn.attributes.tabindex).to.equal('0');
});