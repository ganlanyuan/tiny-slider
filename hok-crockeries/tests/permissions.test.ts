import assert from 'node:assert/strict';
import test from 'node:test';

import { can, ROLE_CAPABILITIES, stripCostFields, visibleProduct, visibleProducts } from '../src/lib/permissions';
import { ROLES, type Role } from '../src/lib/types';

const product = {
  id: 'p1', sku: 'P1', name: 'Plate', categoryId: 'c1', unit: 'pcs',
  costPrice: 10, srPrice: 25, marketPrice: 32, inStore: 4, lowStockThreshold: 5,
  active: true,
};

test('only the owner holds cost.view', () => {
  assert.equal(can('ADMIN', 'cost.view'), true);
  for (const role of ['MANAGER', 'SR', 'DEALER'] as Role[]) {
    assert.equal(can(role, 'cost.view'), false, `${role} must not see cost`);
    assert.equal(can(role, 'report.profit'), false, `${role} must not see profit`);
  }
});

test('an unauthenticated viewer holds nothing', () => {
  assert.equal(can(undefined, 'product.view'), false);
  assert.equal(can(undefined, 'cost.view'), false);
});

test('costPrice is deleted, not zeroed, for every non-owner', () => {
  assert.equal(visibleProduct(product, 'ADMIN').costPrice, 10);
  for (const role of ['MANAGER', 'SR', 'DEALER'] as Role[]) {
    const seen = visibleProduct(product, role);
    assert.equal('costPrice' in seen, false, `${role} received a costPrice key`);
    assert.equal(seen.srPrice, 25, 'the SR rate is still there');
    assert.equal(seen.marketPrice, 32, 'the market price is still there');
  }
});

test('bulk product visibility strips cost from every row', () => {
  const rows = visibleProducts([product, { ...product, id: 'p2' }], 'SR');
  assert.equal(rows.length, 2);
  assert.ok(rows.every((r) => !('costPrice' in r)));
  assert.equal(JSON.stringify(rows).includes('costPrice'), false);
});

test('cost-derived fields are scrubbed from arbitrary payloads', () => {
  const payload = {
    revenue: 100, costPrice: 10, totalCost: 40, grossProfit: 60,
    netProfit: 50, margin: 60, stockCostValue: 400,
  };
  assert.deepEqual(stripCostFields(payload, 'ADMIN'), payload);
  assert.deepEqual(stripCostFields(payload, 'MANAGER'), { revenue: 100 });
  assert.deepEqual(stripCostFields(payload, 'SR'), { revenue: 100 });
});

test('an SR can only reach their own book', () => {
  assert.equal(can('SR', 'sale.view.own'), true);
  assert.equal(can('SR', 'sale.view.all'), false);
  assert.equal(can('SR', 'deposit.view.own'), true);
  assert.equal(can('SR', 'deposit.view.all'), false);
  assert.equal(can('SR', 'user.view'), false);
  assert.equal(can('SR', 'expense.view'), false);
  assert.equal(can('SR', 'report.view'), false);
});

test('a dealer is read-only on the catalogue and nothing else', () => {
  assert.deepEqual([...ROLE_CAPABILITIES.DEALER], ['product.view']);
  assert.equal(can('DEALER', 'sale.view.own'), false);
  assert.equal(can('DEALER', 'product.manage'), false);
});

test('a manager runs operations but cannot appoint staff or change settings', () => {
  assert.equal(can('MANAGER', 'inventory.manage'), true);
  assert.equal(can('MANAGER', 'assignment.manage'), true);
  assert.equal(can('MANAGER', 'deposit.receive'), true);
  assert.equal(can('MANAGER', 'demand.manage'), true);
  assert.equal(can('MANAGER', 'user.view'), true);
  assert.equal(can('MANAGER', 'user.manage'), false, 'only the owner appoints staff');
  assert.equal(can('MANAGER', 'salary.manage'), false, 'only the owner pays salary');
  assert.equal(can('MANAGER', 'settings.manage'), false);
});

test('the owner holds every capability', () => {
  for (const capability of ROLE_CAPABILITIES.ADMIN) {
    assert.equal(can('ADMIN', capability), true);
  }
  for (const role of ROLES) {
    for (const capability of ROLE_CAPABILITIES[role]) {
      assert.equal(can('ADMIN', capability), true, `owner is missing ${capability}`);
    }
  }
});
