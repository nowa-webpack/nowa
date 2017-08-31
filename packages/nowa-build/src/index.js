import webpack from 'webpack';
import merge from 'webpack-merge';
import { presetToOptions } from 'webpack/lib/Stats';
import { Component, filterUndefined } from 'nowa-core';

const mergeAliasToConfig = ({ alias = {}, config = {} }) => {
  const result = merge(
    config,
    filterUndefined({
      output: alias.output,
      entry: alias.entry,
      externals: alias.externals,
      watch: alias.watch,
      watchOptions: alias.watchOptions,
      resolve: {
        alias: alias.alias,
      },
    }),
  );
  result.plugins = result.plugins || [];
  alias.define && result.plugins.push(new webpack.DefinePlugin(alias.define));
  alias.provide && result.plugins.push(new webpack.ProvidePlugin(alias.provide));
  return result;
};

export default class Build extends Component {
  static description = 'compile your project to a bundle';

  static initHelp = async ({ yargs }) => {
    yargs
      .usage('$0 build [config]')
      .option('entry', {
        alias: 'e',
        describe: 'entry file',
        type: 'string',
      })
      .option('entryPath', {
        alias: 'ep',
        describe: 'treat all subfoldes as entries',
        type: 'string',
      })
      .option('outputPath', {
        alias: 'op',
        describe: 'directory where the bundle goes',
        type: 'string',
      })
      .option('outputFilename', {
        alias: 'of',
        describe: 'the name of output bundle',
        type: 'string',
      })
      .option('outputPublicPath', {
        alias: 'opp',
        describe: 'path for webpack to resolve chunks',
        type: 'string',
      })
      .option('outputJsonpFunction', {
        alias: 'opj',
        describe: 'JSONP callback funcition name for loading on-demand chunks',
        type: 'string',
      })
      .option('watch', {
        alias: 'w',
        describe: 'turn on watch mode',
        type: 'string',
      })
      .option('customFlag', {
        alias: 'f',
        describe: 'flag string, will be passed to config as __custom',
        type: 'string',
      });
  };

  processConfig = async ({ overrideConfig = {}, packageConfig = {}, argv = {} }) => {
    return merge(
      mergeAliasToConfig(packageConfig),
      mergeAliasToConfig(overrideConfig),
      filterUndefined({
        entry: argv.entry,
        output: {
          path: argv.outputPath,
          filename: argv.outputFilename,
          publicPath: argv.outputPublicPath,
          jsonpFunction: argv.outputJsonpFunction,
        },
      }),
    );
  };

  run = async ({ finalConfig }) => {
    const config = finalConfig;
    const compiler = webpack(config);
    const outputOptions = (() => {
      const stats = config.stats;
      if (typeof stats === 'boolean' || typeof stats === 'string') {
        return presetToOptions(stats);
      }
      return stats || {};
    })();
    let lastHash;
    const callback = (err, stats) => {
      if (err) {
        compiler.purgeInputFileSystem();
        lastHash = null;
        console.error(err.stack || err);
        err.details && console.error(err.details);
        process.exit(1);
      }
      if (stats.hash !== lastHash) {
        console.log('=========== New Build ==========');
        console.log(`BuildTime: ${new Date().toLocaleString()}`);
        lastHash = stats.hash;
        var statsString = stats.toString(outputOptions);
        statsString && process.stdout.write(statsString + '\n');
      }
    };
    if (config.watch) {
      compiler.watch(config.watchOptions, callback);
    } else {
      compiler.run(callback);
    }
  };
}
