/**
 * Raw-HTML posts: bodies that are HTML documents rather than markdown.
 *
 * Some authoring tools publish whole HTML pages. The legacy viewer detects
 * those with two regular expressions (`components/elements/MarkdownViewer.tsx`)
 * and skips the markdown step for them, because running markdown over HTML
 * markup damages it: `_underscores_` inside text become emphasis, `#` at a line
 * start becomes a heading, blank lines split the document into paragraphs.
 *
 * This module reproduces that decision inside the remark pipeline so that the
 * editor preview and the post page share one code path. It has to run before
 * any other remark plugin: it replaces the parsed tree wholesale, so anything
 * that ran earlier would be discarded.
 */
import type { Root as MdastRoot } from 'mdast';
import type { VFile } from 'vfile';

/**
 * A complete document wrapped in `<html>…</html>`. The shell is stripped: the
 * capture group is the body that gets rendered.
 */
const HTML_SHELL_RE = /^<html>([\S\s]*)<\/html>$/;

/** A body that starts with a `<p>…</p>` block (an HTML fragment). */
const LEADING_P_RE = /^<p>[\S\s]*<\/p>/;

/**
 * Whether `body` is a raw-HTML post.
 *
 * The two expressions are the legacy ones, character for character, including
 * their sharp edges: the `<html>` shell must be exactly that (no attributes,
 * no doctype, nothing before or after), and `$` without the `m` flag only
 * matches at the very end of the string. Keeping them identical is what makes
 * `isHtml` agree with `MarkdownViewer`'s class name and JSON-metadata format.
 *
 * Neither expression can backtrack catastrophically: there are no nested
 * quantifiers, and the greedy `[\S\s]*` gives up one character at a time while
 * re-testing a short literal, which stays linear in the length of the body.
 */
export function isRawHtmlPost(body: string): boolean {
  return HTML_SHELL_RE.test(body) || LEADING_P_RE.test(body);
}

/**
 * Replace the parsed markdown tree with the body's raw HTML.
 *
 * - `<html>…</html>`: the tree becomes the shell-less content.
 * - leading `<p>`: the tree becomes the whole body.
 *
 * The single `html` node keeps remark-rehype from interpreting anything, while
 * `allowDangerousHtml` carries it through to rehype-raw, which parses it as
 * real markup together with everything sanitize needs to see.
 */
export function remarkRawHtmlPosts(): (tree: MdastRoot, file: VFile) => void {
  return (tree, file) => {
    const source = String(file);
    const shell = HTML_SHELL_RE.exec(source);
    if (shell) {
      tree.children = [{ type: 'html', value: shell[1] }];
      return;
    }
    if (LEADING_P_RE.test(source)) {
      tree.children = [{ type: 'html', value: source }];
    }
  };
}
