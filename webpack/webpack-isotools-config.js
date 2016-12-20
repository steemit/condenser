const webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');

module.exports = {
    webpack_assets_file_path: process.env.NODE_ENV === 'production' ? 'tmp/webpack-isotools-assets-prod.json' : 'tmp/webpack-isotools-assets-dev.json',
    assets: {
        images:
        {
            extensions: ['png', 'jpg']
        },
        fonts:
        {
            extensions: ['woff', 'ttf']
        },
        //png_images: {
        //    extension: 'png', //
        //    filter: function(module, regular_expression, options, log)
        //    {
        //        return regular_expression.test(module.name)
        //    },
        //    path: function(module, options, log)
        //    {
        //        return module.name
        //    },
        //
        //},
        styles: {
            extensions: ['css', 'scss'],

            // which `module`s to parse CSS from:
            filter(module, regular_expression, options, log) {
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
                    return webpack_isomorphic_tools_plugin.style_loader_filter(module, regular_expression, options, log);
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
            path: webpack_isomorphic_tools_plugin.style_loader_path_extractor,

            // How to extract these Webpack `module`s' javascript `source` code.
            // basically takes `module.source` and modifies `module.exports` a little.
            parser: webpack_isomorphic_tools_plugin.css_loader_parser
        },
        svg: {
            extension: 'svg',
            parser: webpack_isomorphic_tools_plugin.url_loader_parser
            //parser: function(m, options) {
            //    console.log("-- exports.parser -->", m.source);
            //    //if (m.source) {
            //    //    var regex = /module\.exports = "((.|\n)*)"/;
            //    //    var match = m.source.match(regex);
            //    //    var r = match ? match[1] : "";
            //    //    //console.log("-- exports.parser res 0 -->", r);
            //    //    r = decodeURI(r); //.replace(/&quot;/g,'"');
            //    //    console.log("-- exports.parser res 1 -->", r);
            //    //    return r;
            //    //}
            //    return m.source.replace(/&quot;/g, "'");
            //}
        }
    }
};
