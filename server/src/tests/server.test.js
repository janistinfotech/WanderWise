process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert');
const { app } = require('../index');
const { initDb } = require('../config/db');

// Helper to make test HTTP requests using native fetch against ephemeral port
let server;
let baseUrl;

test.before(async () => {
  process.env.NODE_ENV = 'test';
  await initDb();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Backend Health API returns healthy status and v1.0.0', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'healthy');
  assert.strictEqual(data.version, '1.0.0');
  assert.ok(data.timestamp);
});

test('Destinations API returns seeded Philippine destinations', async () => {
  const res = await fetch(`${baseUrl}/api/destinations`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(Array.isArray(data.destinations));
  assert.ok(data.destinations.length >= 5);

  const palawan = data.destinations.find(d => d.name.includes('Palawan'));
  assert.ok(palawan, 'Palawan destination should exist in seed data');
});

test('Auth Register rejects missing fields with 400', async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'incomplete@example.com' })
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('Auth Login authenticates demo user and returns JWT token', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@wanderwise.com',
      password: 'password123'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.token, 'Should return a valid JWT token');
  assert.strictEqual(data.user.email, 'demo@wanderwise.com');
});

test('Protected Trips API requires authorization header', async () => {
  const res = await fetch(`${baseUrl}/api/trips`);
  assert.strictEqual(res.status, 401);
});
