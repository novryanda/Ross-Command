import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const apiRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(apiRoot, '..', '..');
const controllersDir = path.join(apiRoot, 'src');

const expectedCustomEndpoints = new Set([
  'GET /api/v1/auth/me',
  'POST /api/v1/auth/admin/unlock-user',
  'PATCH /api/v1/auth/admin/reset-password',
  'GET /api/v1/units',
  'POST /api/v1/units',
  'GET /api/v1/units/:unitId',
  'PATCH /api/v1/units/:unitId',
  'DELETE /api/v1/units/:unitId',
  'POST /api/v1/units/:unitId/members',
  'PATCH /api/v1/units/:unitId/members/:userId/transfer',
  'GET /api/v1/users',
  'POST /api/v1/users',
  'GET /api/v1/users/:userId',
  'PATCH /api/v1/users/:userId',
  'DELETE /api/v1/users/:userId',
  'GET /api/v1/users/:userId/social-accounts',
  'GET /api/v1/social-accounts',
  'POST /api/v1/social-accounts',
  'PATCH /api/v1/social-accounts/:socialAccountId',
  'DELETE /api/v1/social-accounts/:socialAccountId',
  'GET /api/v1/orders',
  'POST /api/v1/orders',
  'GET /api/v1/orders/:orderId',
  'PATCH /api/v1/orders/:orderId',
  'POST /api/v1/orders/:orderId/send',
  'POST /api/v1/orders/:orderId/cancel',
  'GET /api/v1/orders/:orderId/assignments',
  'GET /api/v1/orders/:orderId/assignments/by-unit',
  'GET /api/v1/orders/:orderId/assignments/export',
  'GET /api/v1/orders/:orderId/bulk-submission',
  'POST /api/v1/orders/:orderId/bulk-submission',
  'POST /api/v1/orders/:orderId/assignments/:assignmentId/submit',
  'GET /api/v1/assignments/me/:assignmentId',
  'POST /api/v1/assignments/me/:assignmentId/submit',
  'GET /api/v1/dashboard/commander',
  'GET /api/v1/dashboard/member',
  'GET /api/v1/dashboard/admin',
  'GET /api/v1/commander/members',
  'GET /api/v1/commander/members/by-unit',
  'GET /api/v1/commander/members/:userId',
]);

const controllerFiles = [
  'src/auth/auth.controller.ts',
  'src/units/units.controller.ts',
  'src/users/users.controller.ts',
  'src/social-accounts/social-accounts.controller.ts',
  'src/orders/orders.controller.ts',
  'src/assignments/assignments.controller.ts',
  'src/dashboard/dashboard.controller.ts',
  'src/commander/commander.controller.ts',
];

const proxyFiles = [
  path.join(repoRoot, 'apps', 'fe', 'src', 'app', 'api', 'auth', '[...path]', 'route.ts'),
  path.join(repoRoot, 'apps', 'fe', 'src', 'app', 'api', 'v1', '[...path]', 'route.ts'),
];

function main() {
  const actualCustomEndpoints = new Set<string>();

  for (const relativeFile of controllerFiles) {
    const absoluteFile = path.join(apiRoot, relativeFile);
    const content = readFileSync(absoluteFile, 'utf8');
    const controllerMatch = content.match(
      /@Controller\(\s*['"`]([^'"`]+)['"`]\s*\)/,
    );

    if (!controllerMatch) {
      throw new Error(`Gagal membaca base path controller: ${relativeFile}`);
    }

    const basePath = controllerMatch[1];
    const routeRegex = /@(Get|Post|Patch|Put|Delete)\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/g;
    for (const match of content.matchAll(routeRegex)) {
      const method = match[1].toUpperCase();
      const subPath = match[2] ?? '';
      actualCustomEndpoints.add(
        `${method} ${normalizeRoute(`/api/v1/${basePath}/${subPath}`)}`,
      );
    }
  }

  const missing = [...expectedCustomEndpoints].filter(
    (endpoint) => !actualCustomEndpoints.has(endpoint),
  );
  const extra = [...actualCustomEndpoints].filter(
    (endpoint) => !expectedCustomEndpoints.has(endpoint),
  );
  const missingProxyFiles = proxyFiles.filter((filePath) => !existsSync(filePath));

  if (missing.length || extra.length || missingProxyFiles.length) {
    if (missing.length) {
      console.error('Endpoint custom yang belum ada:');
      for (const endpoint of missing) {
        console.error(`- ${endpoint}`);
      }
    }

    if (extra.length) {
      console.error('Endpoint custom tambahan yang belum terdaftar di spec:');
      for (const endpoint of extra) {
        console.error(`- ${endpoint}`);
      }
    }

    if (missingProxyFiles.length) {
      console.error('Proxy route Next.js yang wajib belum ada:');
      for (const filePath of missingProxyFiles) {
        console.error(`- ${path.relative(repoRoot, filePath)}`);
      }
    }

    process.exitCode = 1;
    return;
  }

  console.log(
    `OK ${actualCustomEndpoints.size} endpoint custom sesuai API spec summary table.`,
  );
  console.log('OK Proxy Next.js untuk /api/auth/* dan /api/v1/* tersedia.');
}

function normalizeRoute(input: string) {
  return input.replace(/\/+/g, '/').replace(/\/$/, '');
}

main();
