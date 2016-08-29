import colors from 'colors/safe';
import tar from 'tar-fs';
import Docker from 'dockerode';
import JSONStream from 'JSONStream';
import { gitDescribeSync } from 'git-describe';
import { name } from '../package.json';

export default async (args = {}) => {
  if (!args.only) {
    await require('./build')(args);
  }

  console.log(colors.yellow('Image...'));

  const { release, repo, tag } = Object.assign(
    {
      release: false,
      repo: name.replace('-', '/'),
      tag: (() => (
        args.release &&
        gitDescribeSync({ match: /v?[0-9]+(\.[0-9]+)*/ }).tag ||
        'latest'
      ))(),
    },
    args
  );

  if (args.help) {
    console.log('  Create a Docker image. Options:');
    console.log(`  ${colors.gray('release')}: Build a prodution ready version (${release})`);
    console.log(`  ${colors.gray('repo')}: Docker image repository/name (${repo})`);
    console.log(`  ${colors.gray('tag')}: Docker image tag (${tag})`);
    return;
  }

  return new Promise((resolve, reject) => {
    const t = `${repo}:${tag}`;
    console.log(`build docker image ${t}`); // eslint-disable-line no-console
    const docker = new Docker();
    const tarStream = tar.pack(process.cwd(), {
      entries: ['dist', 'package.json', 'Dockerfile'],
    });

    docker.buildImage(
      tarStream,
      { t },
      (err, stream) => {
        if (err) {
          return reject(err);
        }

        stream
          .pipe(JSONStream.parse('stream'))
          .pipe(process.stdout, {end: true});

        stream.on('end', function() {
          resolve(t);
        });

        stream.on('error', function(error) {
          reject(error);
        });
      }
    );
  });
};
