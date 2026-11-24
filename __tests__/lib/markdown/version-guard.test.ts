// @vitest-environment node
/**
 * Version-family guard for the unified ecosystem behind the markdown pipeline.
 *
 * bytemd 1.22.0 belongs to the unified 10 family. Mixing in a package from the
 * unified 11 family (mdast-util-gfm-* 2.x, micromark-extension-gfm-* 2.x,
 * unified 11, @types/unist 3, ...) does not fail at install time: it fails at
 * runtime with obscure errors such as
 * `Cannot set properties of undefined (setting 'inTable')` when the first
 * table is rendered. This suite pins the major version of every package on the
 * real resolution path, so a lockfile refresh that drifts across the family
 * boundary turns CI red instead of breaking tables in production.
 *
 * pnpm uses a strict node_modules layout: transitive dependencies are not
 * resolvable from the project root. Every package below is therefore resolved
 * the way its real consumer resolves it (Node's own algorithm, starting from
 * the consumer's real directory), not from the project root. Real paths
 * matter: project-root links such as node_modules/bytemd are symlinks, and
 * resolving from the symlink location would find the root copies instead.
 */
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/** Repository root (this file lives at __tests__/lib/markdown/). */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

function readPackage(dir: string): { name?: string; version?: string } | null {
  try {
    return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
      name?: string;
      version?: string;
    };
  } catch {
    // Not a package root (or not readable): the caller keeps walking up.
    return null;
  }
}

/**
 * Real directory of the package `name` as resolved by a module inside
 * `fromDir`.
 *
 * `name/package.json` is preferred. Some packages (bytemd among them) hide it
 * behind their `exports` map; in that case resolve the entry point and walk up
 * to the nearest directory whose package.json carries that name.
 */
function packageDir(name: string, fromDir: string): string {
  const require = createRequire(join(realpathSync(fromDir), 'package.json'));

  try {
    return realpathSync(dirname(require.resolve(`${name}/package.json`)));
  } catch {
    // Hidden by `exports`: fall through to the entry-point walk.
  }

  let dir = realpathSync(dirname(require.resolve(name)));
  for (;;) {
    const pkg = readPackage(dir);
    if (pkg?.name === name) return dir;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`Cannot locate the package root of "${name}" from ${fromDir}`);
    }
    dir = parent;
  }
}

function major(name: string, fromDir: string): number {
  const version = readPackage(packageDir(name, fromDir))?.version;
  const [majorPart] = String(version).split('.');
  return Number(majorPart);
}

// Anchors: each directory is where the named package's real consumer lives.
const BYTEMD_DIR = packageDir('bytemd', ROOT);
const REMARK_PARSE_DIR = packageDir('remark-parse', BYTEMD_DIR);
const MDAST_FROM_MARKDOWN_DIR = packageDir('mdast-util-from-markdown', REMARK_PARSE_DIR);
const UNIFIED_DIR = packageDir('unified', BYTEMD_DIR);

/** One row per package: name, directory of its real consumer, expected major. */
const FAMILY: ReadonlyArray<readonly [string, string, number]> = [
  // The family boundary (plan section 3.2).
  ['unified', BYTEMD_DIR, 10],
  ['mdast-util-from-markdown', MDAST_FROM_MARKDOWN_DIR, 1],
  // bytemd's direct dependencies.
  ['remark-parse', BYTEMD_DIR, 10],
  ['remark-rehype', BYTEMD_DIR, 10],
  ['rehype-raw', BYTEMD_DIR, 6],
  ['rehype-sanitize', BYTEMD_DIR, 5],
  ['rehype-stringify', BYTEMD_DIR, 9],
  ['hast-util-sanitize', packageDir('rehype-sanitize', BYTEMD_DIR), 4],
  ['hast-util-raw', packageDir('rehype-raw', BYTEMD_DIR), 7],
  ['micromark', MDAST_FROM_MARKDOWN_DIR, 3],
  ['vfile', BYTEMD_DIR, 5],
  ['@types/unist', UNIFIED_DIR, 2],
  // @bytemd/plugin-breaks is a direct dependency; remark-breaks is its own.
  ['remark-breaks', packageDir('@bytemd/plugin-breaks', ROOT), 3],
  // Direct dependencies of this repository, imported by lib/markdown/gfm.ts.
  ['mdast-util-gfm-strikethrough', ROOT, 1],
  ['mdast-util-gfm-table', ROOT, 1],
  ['mdast-util-gfm-task-list-item', ROOT, 1],
  ['micromark-extension-gfm-strikethrough', ROOT, 1],
  ['micromark-extension-gfm-table', ROOT, 1],
  ['micromark-extension-gfm-task-list-item', ROOT, 1],
  // Direct devDependency: the reference of the nesting parity suite. The same
  // version rehype-raw resolves to, or the suite would check against another parser.
  ['parse5', ROOT, 6],
  ['parse5', packageDir('hast-util-raw', BYTEMD_DIR), 6],
];

describe('lib/markdown version-family guard', () => {
  it('resolves the anchor packages themselves (sanity check of the resolver)', () => {
    expect(major('bytemd', ROOT)).toBe(1);
    expect(major('@bytemd/plugin-breaks', ROOT)).toBe(1);
    // The anchors are the store copies, not the root-level symlinks.
    expect(BYTEMD_DIR).toContain(`${join('node_modules', '.pnpm')}${sep}bytemd@`);
    expect(UNIFIED_DIR).toContain(`${join('node_modules', '.pnpm')}${sep}unified@`);
  });

  it.each(FAMILY)('%s stays on major version %i (resolved from its consumer)', (name, from, expected) => {
    expect(major(name, from)).toBe(expected);
  });

  it('uses a single @types/unist instance across the whole tree', () => {
    // bytemd, remark-rehype and hast-util-sanitize pull @types/mdast / @types/hast,
    // which in turn depend on @types/unist. A second copy from another major
    // would silently produce incompatible node types.
    const consumers = [
      UNIFIED_DIR,
      packageDir('@types/mdast', ROOT),
      packageDir('remark-rehype', BYTEMD_DIR),
      packageDir('hast-util-sanitize', BYTEMD_DIR),
    ];
    const dirs = new Set(consumers.map((dir) => packageDir('@types/unist', dir)));
    expect(dirs.size).toBe(1);
  });
});
