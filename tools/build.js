/**
 * Compiles the project from source files into a distributable
 * format and copies it to the output (build) folder.
 */
export default async (args) => {
  await require('./clean')(args);
  await require('./copy')(args);
  await require('./bundle')(args);
};
