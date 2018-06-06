import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import writeStats from './utils/write-stats';
import alias from './alias'

const Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');
const webpack_isomorphic_tools_plugin =
    new Webpack_isomorphic_tools_plugin(require('./webpack-isotools-config'))
        .development();

export default {
    entry: {
        app: ['babel-polyfill', './app/Main.js'],
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
            {test: /\.(jpe?g|png|gif)/, use: 'url-loader?limit=4096'},
            {test: /\.json$/, use: 'json-loader'},
            {test: /\.js$|\.jsx$/, exclude: /node_modules/, use: 'babel-loader'},
            {test: /\.svg$/, use: 'svg-inline-loader'},
            {
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                }
            },
            {
                test: require.resolve("blueimp-file-upload"),
                use: "imports?define=>false"
            },
            {
                test: require.resolve("medium-editor-insert-plugin"),
                use: "imports?define=>false"
            },
            {
                test: /\.css$/,
                use: [
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
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'autoprefixer-loader'
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                outputStyle: 'expanded'
                            }
                        }
                    ]
                })
            },
            {
                test: /\.md/,
                use: 'raw-loader'
            }
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
        new ExtractTextPlugin('[name]-[chunkhash].css')
    ],
    resolve: {
        modules: [
            path.resolve(__dirname, '../app'),
            'node_modules'
        ],
        extensions: ['.js', '.json', '.jsx'],
        alias,
    }
};
