const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const writeStats = require('./utils/write-stats');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');
const webpack_isomorphic_tools_plugin =
    new Webpack_isomorphic_tools_plugin(require('./webpack-isotools-config'))
        .development();

const css_loaders = [
    {
        loader: 'style-loader',
    },
    {
        loader: 'css-loader',
    },
    {
        loader: 'autoprefixer-loader'
    }
]

const scss_loaders = [
    {
        loader: 'css-loader',
    },
    {
        loader: 'autoprefixer-loader'
    },
    {
        loader: 'sass-loader'
    }
]

module.exports = {
    entry: {
        app: ['babel-polyfill', './src/app/Main.js'],
        vendor: [
            'react',
            'react-dom',
            'react-router',
            '@steemit/steem-js',
            'slate',
            'slate-drop-or-paste-images',
            'slate-insert-block-on-enter',
            'slate-trailing-block',
            'bytebuffer',
            'immutable',
            'autolinker',
            'pako',
            'remarkable',
            'picturefill'
        ]
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
        publicPath: '/assets/'
    },
    module: {
        rules: [
            {test: /\.(jpe?g|png|gif)/, use: 'url-loader?limit=4096'},
            {test: /\.json$/, use: 'json-loader'},
            {test: /\.js$|\.jsx$/, exclude: [/node_modules/, /\*\/app\/assets\/static\/\*\.js/], use: 'babel-loader'},
            {test: /\.svg$/, use: 'svg-inline-loader'},
            {
                test: require.resolve("blueimp-file-upload"),
                use: "imports?define=>false"
            },
            {
                test: /\.css$/,
                use: css_loaders
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: scss_loaders
                })
            },
            {
                test: /\.md/,
                use: 'raw-loader'
            },
            {
                loader: 'file-loader?name=[name].[hash].[ext]&limit=1',
                test: /\.(eot|ttf|woff|woff2)(\?.+)?$/,
            },
        ]
    },
    plugins: [
        function () {
            this.plugin('done', writeStats);
        },
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
           names: 'vendor',
           minChunks: Infinity
        }),
        webpack_isomorphic_tools_plugin,
        new ExtractTextPlugin('[name]-[chunkhash].css'),
        new CopyWebpackPlugin(
            [
                {
                    from: path.resolve(__dirname, '../src/app/assets/js/jquery-3.6.0.min.js'),
                    to: path.resolve(__dirname, '../dist/js/jquery-3.6.0.min.js')
                },
                {
                    from: path.resolve(__dirname, '../src/app/assets/js/jquery-3.6.0.min.map'),
                    to: path.resolve(__dirname, '../dist/js/jquery-3.6.0.min.map')
                },
                {
                    from: path.resolve(__dirname, '../src/app/assets/js/tron-ads-sdk-1.0.49.js'),
                    to: path.resolve(__dirname, '../dist/js/tron-ads-sdk-1.0.49.js')
                },
                {
                    from: path.resolve(__dirname, '../src/app/assets/plugins'),
                    to: path.resolve(__dirname, '../dist/plugins/')
                },
            ], {
                ignore: [
                    '../src/app/assets/plugins/editor.md/examples',
                    '../src/app/assets/plugins/editor.md/scss',
                    '../src/app/assets/plugins/editor.md/src',
                    '../src/app/assets/plugins/editor.md/tests',
                ],
            }
        ),
    ],
    resolve: {
        alias: {
            react: path.join(__dirname, '../node_modules', 'react'),
            assets: path.join(__dirname, '../src/app/assets'),
            // editormd: path.join(__dirname, '../src/app/assets/js/plugins/editor.md'),
            // $: path.join(__dirname, '../src/app/assets/js/jquery-3.1.0.slim.js'),
            // editormdlib: path.join(__dirname, '../src/app/assets/js/lib'),
        },
        extensions: ['.js', '.json', '.jsx'],
        modules: [
            path.resolve(__dirname, '../src'),
            'node_modules'
        ]
    },
    externals: {
    }
};
