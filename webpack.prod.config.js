/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const baseConfig = require('./webpack.config.js');

module.exports = Object.assign({}, baseConfig, {
  cache: false,
  debug: false,

  devtool: 'cheap-module-source-map',

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true,
      },
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
});
