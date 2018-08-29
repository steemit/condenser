const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const alias = require('./alias');

module.exports = (baseConfig, env, defaultConfig) =>
    merge(removeSvgLoaders(defaultConfig), {
        resolve: {
            modules: [path.resolve(__dirname, '..'), 'node_modules'],
            extensions: ['.js', '.json', '.jsx'],
            alias,
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    BROWSER: JSON.stringify(true),
                },
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.js$|\.jsx$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: /\.(jpe?g|png)/,
                    loader: 'url-loader',
                    options: {
                        limit: 4096,
                    },
                },
                { test: /\.svg$/, use: 'svg-inline-loader' },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [
                                    require('autoprefixer')({
                                        browsers: ['> 1%', 'last 2 versions'],
                                    }),
                                ],
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.md/,
                    use: 'raw-loader',
                },
            ],
        },
    });


function removeSvgLoaders(config) {
    config.module.rules = config.module.rules.filter(rule => rule.test.toString() !== '/\\.svg$/')
    return config;
}