import webpack from 'webpack';
import colors from 'colors/safe';

/**
 * Bundles JavaScript, CSS and images into one or more packages
 * ready to be used in a browser.
 */
export default async (args = {}) => new Promise((resolve, reject) => {
  console.log(colors.yellow('Bundle...'));

  const { release, watch } = Object.assign(
    {
      release: false,
      watch: false,
    },
    args
  );

  if (args.help) {
    console.log('  Use Webpack to create the output bundle. Options:');
    console.log(`  ${colors.gray('release')}: Build a prodution ready version (${release})`);
    console.log(`  ${colors.gray('watch')}: Use Webpack watch (${watch})`);
    return resolve();
  }

  const config = release ? require('../webpack.prod.config') : require('../webpack.config');
  const bundler = webpack(config);
  let bundlerRunCount = 0;

  function bundle(err, stats) {
    if (err) {
      return reject(err);
    }

    console.log(stats.toString({
      colors: true,
      hash: false,
      version: false,
      chunks: false,
      children: true,
    }));

    if (++bundlerRunCount === (global.watch ? config.length : 1)) {
      return resolve();
    }
  }

  if (watch) {
    bundler.watch(200, bundle);
  } else {
    bundler.run(bundle);
  }
});
