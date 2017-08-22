import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import writeStats from './utils/write-stats';

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

export default {
    entry: {
        app: ['babel-polyfill', './src/app/Main.js'],
        vendor: ['react', 'react-dom', 'react-router']
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
        publicPath: '/assets/'
    },
    module: {
        rules: [
            {test: /\.(jpe?g|png)/, loader: 'url-loader?limit=4096'},
            {test: /\.json$/, loader: 'json-loader'},
            {test: /\.js$|\.jsx$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.svg$/, loader: 'svg-inline-loader'},
            {
                test: require.resolve("blueimp-file-upload"),
                loader: "imports?define=>false"
            },
            {
                test: require.resolve("medium-editor-insert-plugin"),
                loader: "imports?define=>false"
            },
            {
                test: /\.css$/,
                loader: css_loaders
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
                loader: 'raw-loader'
            }
        ]
    },
    plugins: [
        // function () {
        //     this.plugin('done', writeStats);
        // },
        webpack_isomorphic_tools_plugin,
        new ExtractTextPlugin('[name]-[chunkhash].css')
    ],
    resolve: {
        // root: [
        //     path.resolve(__dirname, '../src')
        // ],
        alias: {
            react: path.join(__dirname, '../node_modules', 'react'),
            assets: path.join(__dirname, '../src/app/assets')
        },
        extensions: ['.js', '.json', '.jsx'],
        modules: [
            path.resolve(__dirname, '../src'),
            'node_modules'
        ]
    },
    externals: {
        newrelic: true
    }
};
