const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const alias = require('./alias');

module.exports = {
    context: path.resolve(__dirname, '..'),
    entry: {
        app: ['babel-polyfill', './app/Main.js'],
        // vendor: ['react', 'react-dom', 'react-router']
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
        publicPath: '/assets/',
    },
    module: {
        rules: [
            {
                test: /\.js$|\.jsx$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.(jpe?g|png|gif)/,
                loader: 'url-loader',
                options: {
                    limit: 4096,
                },
            },
            // {
            //     test: /\.svg$/,
            //     exclude: /node_modules/,
            //     use: [
            //         {
            //             loader: 'svg-sprite-loader',
            //         },
            //     ],
            // },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-inline-loader',
                        options: {
                            removeTags: true,
                            removingTags: ['title', 'desc'],
                            removeSVGTagAttrs: true,
                        },
                    }
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/',
                },
            },
            { test: /\.md/, use: 'raw-loader' },
        ],
    },
    plugins: [
        new ProgressBarPlugin({
            format: 'Build [:bar] :percent (:elapsed seconds)',
            clear: false,
        }),
        // new SpriteLoaderPlugin(),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /node_modules/,
                    enforce: true,
                },
                // styles: {
                //     name: 'styles',
                //     test: /\.css$/,
                //     chunks: 'all',
                //     enforce: true,
                // },
            },
        },
    },
    resolve: {
        modules: [path.resolve(__dirname, '..'), 'node_modules'],
        extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
        alias,
    },
};
