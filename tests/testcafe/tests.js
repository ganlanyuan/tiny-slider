fixture `Init`
  .page('http://172.20.20.20:3000/tests/E2E/index.html');

test('First test', async t => {
  console.log('passed!');
})