const test = require('node:test');
const assert = require('node:assert/strict');

let server;
let base;

test.before(async () => {
  const app = require('../src/server');
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
});

test('health endpoint responds', async () => {
  const response = await fetch(`${base}/health`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.status, 'ok');
});

test('frontend shell is served', async () => {
  const response = await fetch(`${base}/`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /SportLog — SRM Student Achievement Portal/);
  assert.match(html, /js\/app\.js/);
});

test('unknown API route returns JSON 404', async () => {
  const response = await fetch(`${base}/achievements/nope/nope`);
  assert.equal(response.status, 404);
  const data = await response.json();
  assert.equal(data.success, false);
});

test('stats endpoint returns stable arrays and numeric totals', async () => {
  const response = await fetch(`${base}/stats`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.success, true);
  assert.equal(typeof data.data.totalAchievements, 'number');
  assert.equal(typeof data.data.totalStudents, 'number');
  assert.ok(Array.isArray(data.data.bySport));
  assert.ok(Array.isArray(data.data.byLevel));
  assert.ok(Array.isArray(data.data.recentWinners));
});

test('signup validates SRM email and registration number', async () => {
  const response = await fetch(`${base}/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      reg_number: 'BAD',
      email: 'test@gmail.com',
      password: 'password123',
      confirm_password: 'password123'
    })
  });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.success, false);
});
