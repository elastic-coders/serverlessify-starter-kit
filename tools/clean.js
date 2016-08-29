import colors from 'colors/safe';
import fse from 'fs-extra-promise';

/**
 * Cleans up the output (build) directory.
 */
export default async (args = {}) => {
  console.log(colors.yellow('Clean...'));

  if (args.help) {
    console.log('  Removes dist files.');
    return;
  }

  await fse.removeAsync('dist/*');
};
