const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const alias = require('./alias')

module.exports = (baseConfig, env, defaultConfig) => merge(defaultConfig, {
  resolve: {
    modules: [
      path.resolve(__dirname, '..'),
      'node_modules'
    ],
    extensions: ['.js', '.json', '.jsx'],
    alias
  },
  plugins: [

    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: JSON.stringify(true),
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$|\.jsx$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.(jpe?g|png)/,
        loader: 'url-loader',
        options: {
          limit: 4096
        }
      },
      { test: /\.svg$/, use: 'svg-inline-loader' },
      {
        test: require.resolve("blueimp-file-upload"),
        use: "imports?define=>false"
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'css-hot-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')({
                'browsers': ['> 1%', 'last 2 versions']
              })],
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ],
      },
      {
        test: /\.md/,
        use: 'raw-loader'
      }
    ]
  },
});