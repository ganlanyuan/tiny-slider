import { expect } from 'chai';
import { Selector } from 'testcafe';

const select = Selector(id => document.querySelector(`${id}`));

fixture `Init`
  .page('http://192.168.103.82:3000/tests/index.html');

// $base
test('base init', async t => {
  await t;

  const base = await select('#base');
  const parent = await base.getParentNode();
  const grandParent = await parent.getParentNode();
  expect(grandParent.attributes['data-tns-role']).to.equal('wrapper');
  expect(grandParent.attributes['data-tns-hidden']).to.equal('x');
  expect(parent.attributes['data-tns-role']).to.equal('content-wrapper');
  expect(base.attributes['data-tns-role']).to.equal('content');
  expect(base.attributes['data-tns-mode']).to.equal('carousel');
  expect(base.attributes['data-tns-features']).to.equal('horizontal');
  expect(base.childElementCount).to.equal(25);

  const child10 = await base.getChildElement(10);
  const child12 = await base.getChildElement(12);
  expect(child10.boundingClientRect.left).to.equal(parent.boundingClientRect.left);
  expect(child12.boundingClientRect.right).to.equal(parent.boundingClientRect.right);

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

test('base nav click', async t => {
  await t;

  const base = await select('#base');
  const parent = await base.getParentNode();

  await t
    .click('.base_wrapper [data-slide="1"]')
    .wait(100);

  const child14 = await base.getChildElement(14);
  const child16 = await base.getChildElement(16);
  expect(child14.boundingClientRect.left).to.equal(parent.boundingClientRect.left);
  expect(child16.boundingClientRect.right).to.equal(parent.boundingClientRect.right);
  
  await t
    .click('.base_wrapper [data-slide="0"]')
    .wait(100);

  const child11 = await base.getChildElement(11);
  const child13 = await base.getChildElement(13);
  expect(child11.boundingClientRect.left).to.equal(parent.boundingClientRect.left);
  expect(child13.boundingClientRect.right).to.equal(parent.boundingClientRect.right);

});

test('base controls click', async t => {
  await t;

  const base = await select('#base');
  const parent = await base.getParentNode();

  await t
    .click('.base_wrapper [data-controls="next"]')
    .wait(100);

  const child11 = await base.getChildElement(11);
  const child13 = await base.getChildElement(13);
  expect(child11.boundingClientRect.left).to.equal(parent.boundingClientRect.left);
  expect(child13.boundingClientRect.right).to.equal(parent.boundingClientRect.right);
  
  await t
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100)
    .click('.base_wrapper [data-controls="next"]')
    .wait(100);

  const child21 = await base.getChildElement(21);
  const child23 = await base.getChildElement(23);
  expect(child21.boundingClientRect.left).to.equal(parent.boundingClientRect.left);
  expect(child23.boundingClientRect.right).to.equal(parent.boundingClientRect.right);

  await t
    .click('.base_wrapper [data-controls="next"]')
    .wait(100);

  const child3 = await base.getChildElement(3);
  const child5 = await base.getChildElement(5);
  expect(child3.boundingClientRect.left).to.equal(parent.boundingClientRect.left);
  expect(child5.boundingClientRect.right).to.equal(parent.boundingClientRect.right);

  await t
    .click('.base_wrapper [data-controls="prev"]')
    .wait(100)
    .click('.base_wrapper [data-controls="prev"]')
    .wait(100);

  expect(child21.boundingClientRect.left).to.equal(parent.boundingClientRect.left);
  expect(child23.boundingClientRect.right).to.equal(parent.boundingClientRect.right);

});