/**
 * Entry point for bundling the legacy (condenser-legacy) render pipeline.
 * Bundled by scripts/compare-render-pipeline.ts via esbuild with aliases for
 * the webpack-style imports used inside the legacy sources.
 */
import HtmlReady from 'shared/HtmlReady';
import sanitizeConfig from 'app/utils/SanitizeConfig';

module.exports = { HtmlReady, sanitizeConfig };
