const webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');
const alias = require('./alias');

module.exports = {
    webpack_assets_file_path:
        process.env.NODE_ENV === 'production'
            ? 'tmp/webpack-isotools-assets-prod.json'
            : 'tmp/webpack-isotools-assets-dev.json',
    alias: alias,
    assets: {
        images: {
            extensions: ['png', 'jpg', 'gif', 'svg']
        },
        fonts: {
            extensions: ['woff', 'woff2', 'eot', 'ttf'],
        },
        styles: {
            extensions: ['css', 'scss'],

            // which `module`s to parse CSS from:
            filter: function(module, regularExpression, options, log) {
                if (options.development) {
                    // In development mode there's Webpack "style-loader",
                    // which outputs `module`s with `module.name == asset_path`,
                    // but those `module`s do not contain CSS text.
                    //
                    // The `module`s containing CSS text are
                    // the ones loaded with Webpack "css-loader".
                    // (which have kinda weird `module.name`)
                    //
                    // Therefore using a non-default `filter` function here.
                    //
                    return webpack_isomorphic_tools_plugin.styleLoaderFilter(
                        module,
                        regularExpression,
                        options,
                        log
                    );
                }

                // In production mode there will be no CSS text at all
                // because all styles will be extracted by Webpack Extract Text Plugin
                // into a .css file (as per Webpack configuration).
                //
                // Therefore in production mode `filter` function always returns non-`true`.
            },

            // How to correctly transform kinda weird `module.name`
            // of the `module` created by Webpack "css-loader"
            // into the correct asset path:
            path: webpack_isomorphic_tools_plugin.styleLoaderPathExtractor,

            // How to extract these Webpack `module`s' javascript `source` code.
            // basically takes `module.source` and modifies `module.exports` a little.
            parser: webpack_isomorphic_tools_plugin.cssLoaderParser,
        },
    },
};
