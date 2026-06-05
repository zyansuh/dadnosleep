import * as esbuild from 'esbuild';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const sourceRoot = 'scripts/api-route-sources';
const apiRoot = 'api';

function collectTsEntries(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      entries.push(...collectTsEntries(path));
      continue;
    }
    if (name.endsWith('.ts') && !name.endsWith('.d.ts')) {
      entries.push(path);
    }
  }
  return entries;
}

const entries = collectTsEntries(sourceRoot);
if (entries.length === 0) {
  console.log('[bundle-api] no route source entries');
  process.exit(0);
}

for (const entry of entries) {
  const rel = relative(sourceRoot, entry);
  const outfile = join(apiRoot, rel.replace(/\.ts$/, '.js'));
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle:    true,
    platform:  'node',
    format:    'esm',
    packages:  'external',
    logLevel:  'warning',
  });
  let code = readFileSync(outfile, 'utf8');
  code = code.replace(/\nexport\s*\{\s*handler\s+as\s+default\s*\};?\s*$/, '\nexport default handler;\n');
  writeFileSync(outfile, code);
  console.log(`[bundle-api] ${rel} -> ${relative(apiRoot, outfile)}`);
}
