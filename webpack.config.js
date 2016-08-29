const path = require('path');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/index.js',
  ],

  devtool: 'cheap-module-eval-source-map',
  cache: true,
  debug: true,

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  externals: [
    (context, request, cb) => {
      const isExternal = request.match(/^[a-z][a-z\/\.\-0-9]*$/i);
      cb(null, Boolean(isExternal));
    },
  ],

  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx'],
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, './src'),
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-0'],
          plugins: ['transform-runtime'],
        },
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: /\.ya?ml$/,
        include: path.resolve(__dirname, './src'),
        loaders: ['json', 'yaml'],
      },
    ],
  },
};
