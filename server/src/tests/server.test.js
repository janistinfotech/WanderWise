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

test('Backend Health API returns healthy status and v1.1.0', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'healthy');
  assert.strictEqual(data.version, '1.1.0');
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

test('Trip CRUD, Itinerary activities, and Budget expenses full lifecycle', async () => {
  // 1. Login demo user
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@wanderwise.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 2. Create a new trip
  const createTripRes = await fetch(`${baseUrl}/api/trips`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Cebu Island Hopping Test',
      destination: 'Moalboal, Cebu',
      start_date: '2026-12-01',
      end_date: '2026-12-05',
      description: 'Testing end-to-end trip creation',
      estimated_budget: 15000,
      status: 'upcoming'
    })
  });
  assert.strictEqual(createTripRes.status, 201);
  const createTripData = await createTripRes.json();
  assert.strictEqual(createTripData.success, true);
  const tripId = createTripData.trip.id;
  assert.ok(tripId);

  // 3. Get trip by ID
  const getTripRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    headers: authHeaders
  });
  assert.strictEqual(getTripRes.status, 200);
  const getTripData = await getTripRes.json();
  assert.strictEqual(getTripData.trip.title, 'Cebu Island Hopping Test');

  // 4. Create Itinerary Activity
  const createActRes = await fetch(`${baseUrl}/api/itineraries/activities`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      trip_id: tripId,
      day_number: 1,
      activity_date: '2026-12-01',
      time_slot: '10:00 AM',
      title: 'Sardine Run Snorkeling',
      location: 'Panagsama Beach',
      notes: 'Bring underwater camera',
      estimated_cost: 500,
      category: 'adventure'
    })
  });
  assert.strictEqual(createActRes.status, 201);
  const actData = await createActRes.json();
  const actId = actData.activity.id;
  assert.ok(actId);

  // 5. Update Activity (Toggle completed status)
  const updateActRes = await fetch(`${baseUrl}/api/itineraries/activities/${actId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ is_completed: true })
  });
  assert.strictEqual(updateActRes.status, 200);
  const updatedActData = await updateActRes.json();
  assert.strictEqual(Boolean(updatedActData.activity.is_completed), true);

  // 6. Record Expense
  const addExpRes = await fetch(`${baseUrl}/api/budget/expenses`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      trip_id: tripId,
      category: 'activities',
      amount: 1200,
      expense_date: '2026-12-01',
      description: 'Snorkeling gear rental & environmental fee',
      notes: 'Paid cash'
    })
  });
  assert.strictEqual(addExpRes.status, 201);
  const expData = await addExpRes.json();
  const expId = expData.expense.id;
  assert.ok(expId);

  // 7. Verify Budget Summary
  const budgetSummaryRes = await fetch(`${baseUrl}/api/budget/trip/${tripId}`, {
    headers: authHeaders
  });
  assert.strictEqual(budgetSummaryRes.status, 200);
  const budgetData = await budgetSummaryRes.json();
  assert.strictEqual(budgetData.budget.totalSpent, 1200);
  assert.strictEqual(budgetData.budget.remainingBudget, 13800);
  assert.strictEqual(budgetData.budget.isOverBudget, false);

  // 8. Delete Trip (cascades activities & expenses)
  const deleteTripRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert.strictEqual(deleteTripRes.status, 200);

  // Verify deleted trip returns 404
  const verifyTripRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    headers: authHeaders
  });
  assert.strictEqual(verifyTripRes.status, 404);
});

test('Multi-user data isolation ensures users cannot access or mutate each others trips', async () => {
  // 1. Create a second user account
  const timestamp = Date.now();
  const userBEmail = `user_b_${timestamp}@example.com`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Traveler B',
      email: userBEmail,
      password: 'password123',
      currency: 'USD'
    })
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  const tokenB = regData.token;
  const authHeadersB = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokenB}`
  };

  // 2. Login demo user (User A)
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@wanderwise.com', password: 'password123' })
  });
  const tokenA = (await loginRes.json()).token;
  const authHeadersA = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokenA}`
  };

  // 3. User A creates a private trip
  const tripARes = await fetch(`${baseUrl}/api/trips`, {
    method: 'POST',
    headers: authHeadersA,
    body: JSON.stringify({
      title: 'User A Private Honeymoon',
      destination: 'Batanes',
      start_date: '2026-11-20',
      end_date: '2026-11-25',
      estimated_budget: 40000
    })
  });
  assert.strictEqual(tripARes.status, 201);
  const tripAId = (await tripARes.json()).trip.id;

  // 4. User B attempts to access User A's trip (should be blocked with 404)
  const accessRes = await fetch(`${baseUrl}/api/trips/${tripAId}`, {
    headers: authHeadersB
  });
  assert.strictEqual(accessRes.status, 404, 'User B must not access User A trip');

  // 5. User B attempts to delete User A's trip (should be blocked with 404)
  const deleteAttemptRes = await fetch(`${baseUrl}/api/trips/${tripAId}`, {
    method: 'DELETE',
    headers: authHeadersB
  });
  assert.strictEqual(deleteAttemptRes.status, 404, 'User B must not delete User A trip');

  // 6. Clean up: User A deletes their trip
  await fetch(`${baseUrl}/api/trips/${tripAId}`, {
    method: 'DELETE',
    headers: authHeadersA
  });
});

test('Favorites toggle API correctly toggles destination favorites', async () => {
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@wanderwise.com', password: 'password123' })
  });
  const token = (await loginRes.json()).token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // Get valid destination ID dynamically
  const destsRes = await fetch(`${baseUrl}/api/destinations`);
  const destsData = await destsRes.json();
  assert.ok(destsData.destinations.length > 0);
  const targetDestId = destsData.destinations[0].id;

  // Toggle favorite for valid destination
  const toggleRes1 = await fetch(`${baseUrl}/api/destinations/${targetDestId}/favorite`, {
    method: 'POST',
    headers: authHeaders
  });
  assert.strictEqual(toggleRes1.status, 200);
  const data1 = await toggleRes1.json();
  assert.strictEqual(data1.success, true);

  // Toggle again to restore
  const toggleRes2 = await fetch(`${baseUrl}/api/destinations/${targetDestId}/favorite`, {
    method: 'POST',
    headers: authHeaders
  });
  assert.strictEqual(toggleRes2.status, 200);
  const data2 = await toggleRes2.json();
  assert.strictEqual(data2.success, true);
  assert.notStrictEqual(data1.is_favorite, data2.is_favorite);
});

test('User Profile update modifies name, currency, and travel style', async () => {
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@wanderwise.com', password: 'password123' })
  });
  const token = (await loginRes.json()).token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const updateRes = await fetch(`${baseUrl}/api/users/profile`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Maria Santos',
      bio: 'Island explorer & photographer.',
      travel_style: 'Island Hopping & Diving',
      currency: 'PHP',
      avatar_url: ''
    })
  });
  assert.strictEqual(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.success, true);
  assert.strictEqual(updateData.user.currency, 'PHP');
  assert.strictEqual(updateData.user.travel_style, 'Island Hopping & Diving');
});

