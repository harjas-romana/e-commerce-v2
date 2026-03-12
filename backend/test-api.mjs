// test-api.mjs
// ─────────────────────────────────────────────────────────────────
//  Quick smoke-test for your Express API — run BEFORE deploying.
//
//  Usage:
//    1. Start your backend:  node server.js   (in another terminal)
//    2. Run this file:       node test-api.mjs
//    3. All checks should show  ✅
//
//  Optional env override:
//    API_URL=https://your-backend.onrender.com node test-api.mjs
// ─────────────────────────────────────────────────────────────────

const BASE = process.env.API_URL ?? 'http://localhost:3001';

// ── Helpers ───────────────────────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

let passed = 0;
let failed = 0;

async function request(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ${c.green('✅')} ${label}`);
    passed++;
  } else {
    console.log(`  ${c.red('❌')} ${label}${detail ? c.dim('  →  ' + detail) : ''}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${c.bold(title)}`);
  console.log(c.dim('─'.repeat(50)));
}

// ── Tests ─────────────────────────────────────────────────────────
async function run() {
  console.log(c.bold(`\n🔍  API Smoke Tests`));
  console.log(c.dim(`    Target: ${BASE}\n`));

  // ── 1. Health ─────────────────────────────────────────────────
  section('Health check');
  const health = await request('GET', '/health');
  check('GET /health returns 200',      health.status === 200);
  check('Response has status field',    health.data?.status === 'OK');

  // ── 2. Products ───────────────────────────────────────────────
  section('Products');
  const products = await request('GET', '/api/products');
  check('GET /api/products returns 200',       products.status === 200,      `got ${products.status}`);
  check('Response is an array',                Array.isArray(products.data), `got ${typeof products.data}`);
  check('Array is non-empty',                  products.data?.length > 0,    `got ${products.data?.length} items`);

  let firstId = null;
  if (products.data?.length > 0) {
    const p = products.data[0];
    firstId = p.id;
    check('Each product has id',          p.id        !== undefined);
    check('Each product has name',        p.name      !== undefined);
    check('Each product has price',       p.price     !== undefined);
    check('Each product has image_url',   p.image_url !== undefined);
    check('Each product has category',    p.category  !== undefined);
  }

  // Single product
  if (firstId) {
    const single = await request('GET', `/api/products/${firstId}`);
    check(`GET /api/products/${firstId} returns 200`, single.status === 200, `got ${single.status}`);
    check('Single product has correct id',            single.data?.id == firstId);
  }

  // 404 for missing product
  const missing = await request('GET', '/api/products/999999');
  check('GET /api/products/999999 returns 404', missing.status === 404, `got ${missing.status}`);

  // Featured filter
  const featured = await request('GET', '/api/products?featured=true');
  check('GET /api/products?featured=true returns 200', featured.status === 200, `got ${featured.status}`);
  check('Featured products are arrays',                Array.isArray(featured.data));
  if (featured.data?.length > 0) {
    check('All returned products are featured', featured.data.every((p) => p.featured === true));
  }

  // ── 3. Categories ─────────────────────────────────────────────
  section('Categories');
  const cats = await request('GET', '/api/categories');
  check('GET /api/categories returns 200',  cats.status === 200,      `got ${cats.status}`);
  check('Response is an array',             Array.isArray(cats.data), `got ${typeof cats.data}`);
  check('Array is non-empty',               cats.data?.length > 0,    `got ${cats.data?.length} categories`);
  if (cats.data?.length > 0) {
    console.log(c.dim(`       Found: ${cats.data.join(', ')}`));
  }

  // ── 4. Auth — Register ────────────────────────────────────────
  section('Auth — Register & Login');
  const testEmail = `test_${Date.now()}@example.com`;
  const testPass  = 'Password123!';

  const reg = await request('POST', '/api/auth/register', {
    body: { email: testEmail, password: testPass, fullName: 'Test User' },
  });
  check('POST /api/auth/register returns 200', reg.status === 200,         `got ${reg.status}`);
  check('Register returns token',              typeof reg.data?.token === 'string');
  check('Register returns user object',        reg.data?.user?.email === testEmail);

  const userToken = reg.data?.token;

  // Login with correct creds
  const login = await request('POST', '/api/auth/login', {
    body: { email: testEmail, password: testPass },
  });
  check('POST /api/auth/login returns 200',  login.status === 200, `got ${login.status}`);
  check('Login returns token',               typeof login.data?.token === 'string');

  // Login with wrong password
  const badLogin = await request('POST', '/api/auth/login', {
    body: { email: testEmail, password: 'wrong' },
  });
  check('Bad credentials return 401', badLogin.status === 401, `got ${badLogin.status}`);

  // ── 5. Orders (authenticated) ─────────────────────────────────
  section('Orders (authenticated)');
  const ordersNoAuth = await request('GET', '/api/orders');
  check('GET /api/orders without token returns 401', ordersNoAuth.status === 401, `got ${ordersNoAuth.status}`);

  if (userToken) {
    const orders = await request('GET', '/api/orders', { token: userToken });
    check('GET /api/orders with token returns 200',   orders.status === 200,        `got ${orders.status}`);
    check('Orders response is an array',              Array.isArray(orders.data),   `got ${typeof orders.data}`);
  }

  // ── 6. Admin — unauthorised guard ─────────────────────────────
  section('Admin guard');
  const statsNoAuth = await request('GET', '/api/admin/stats');
  check('GET /api/admin/stats without token → 401', statsNoAuth.status === 401, `got ${statsNoAuth.status}`);

  if (userToken) {
    const statsNonAdmin = await request('GET', '/api/admin/stats', { token: userToken });
    check('GET /api/admin/stats with non-admin token → 403', statsNonAdmin.status === 403, `got ${statsNonAdmin.status}`);
  }

  // ── Summary ───────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n' + c.dim('═'.repeat(50)));
  console.log(
    c.bold('  Result:'),
    c.green(`${passed} passed`),
    '·',
    failed > 0 ? c.red(`${failed} failed`) : c.dim(`${failed} failed`),
    c.dim(`/ ${total} total`)
  );
  console.log(c.dim('═'.repeat(50)) + '\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(c.red('\n[Fatal] Could not connect to API:'), err.message);
  console.error(c.dim(`  Make sure your server is running at ${BASE}`));
  process.exit(1);
});
