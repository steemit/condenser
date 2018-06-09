const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const alias = require('./alias')

const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    entry: {
        app: ['babel-polyfill', './app/Main.js'],
        // vendor: ['react', 'react-dom', 'react-router']
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
        publicPath: '/assets/'
    },
    module: {
        rules: [
            { 
                test: /\.js$|\.jsx$/, 
                exclude: /node_modules/, 
                use: 'babel-loader' 
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [require('autoprefixer')({
                                'browsers': ['> 1%', 'last 2 versions']
                            })],
                        }
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(jpe?g|png|gif)/,
                loader: 'url-loader',
                options: {
                    limit: 4096
                }
            },
            { test: /\.svg$/, use: 'svg-inline-loader' },
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
            { test: /\.md/, use: 'raw-loader' }
        ]
    },
    plugins: [
        new ProgressBarPlugin({
            format: 'Build [:bar] :percent (:elapsed seconds)',
            clear: false,
        }),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /node_modules/,
                    enforce: true
                },
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    resolve: {
        modules: [
            path.resolve(__dirname, '../app'),
            'node_modules'
        ],
        extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
        alias,
    }
};
