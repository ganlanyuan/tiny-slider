fixture `Init`
  .page('http://192.168.103.82:3000/tests/index.html');

test('First test', async t => {
  console.log('passed!');
})