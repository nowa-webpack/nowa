import webpack from 'webpack';
import portfinder from 'portfinder';
import WebpackDevServer from 'webpack-dev-server';
import addDevServerEntrypoints from 'webpack-dev-server/lib/util/addDevServerEntrypoints';
import createDomain from 'webpack-dev-server/lib/util/createDomain';
import OptionsValidationError from 'webpack-dev-server/lib/OptionsValidationError';
import Build from 'nowa-build';
import { filterUndefined } from 'nowa-core';
import open from 'opn';
import merge from 'webpack-merge';

const DEFAULT_PORT = 8080;

const mergeAliasToConfig = ({ alias = {}, config = {} }) => {
  const result = merge(
    config,
    filterUndefined({
      output: alias.output,
      devServer: alias.devServer,
      entry: alias.entry,
      externals: alias.externals,
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

export default class Server extends Build {
  static description = 'start a server and serve your project for dev';

  static initHelp = async ({ yargs }) => {
    yargs
      .usage('$0 Server')
      .option('entry', {
        alias: 'e',
        describe: 'entry file',
        type: 'string',
      })
      // .option('entryPath', {
      //   alias: 'ep',
      //   describe: 'treat all subfoldes as entries',
      //   type: 'string',
      // })
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
      .option('port', {
        alias: 'port for devserver',
        describe: '',
        type: 'number',
      })
      .option('inline', {
        alias: 'i',
        describe: 'server mode',
        type: 'boolean',
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
        devServer: {
          port: argv.port,
          inline: argv.inline,
        },
      }),
    );
  };

  run = async ({ finalConfig, argv }) => {
    const options = finalConfig.devServer || {};
    if (!options.publicPath) {
      options.publicPath = (finalConfig.output && finalConfig.output.publicPath) || '';
      if (!/^(https?:)?\/\//.test(options.publicPath) && options.publicPath[0] !== '/') {
        options.publicPath = `/${options.publicPath}`;
      }
    }

    if (!options.filename) {
      options.filename = finalConfig.output && finalConfig.output.filename;
    }

    if (!options.watchOptions) {
      options.watchOptions = finalConfig.watchOptions;
    }

    if (!options.stats) {
      options.stats = {
        cached: false,
        cachedAssets: false,
      };
    }

    if (options.open && !options.openPage) {
      options.openPage = '';
    }

    if (!options.host) {
      options.host = 'localhost';
    }

    if (options.port) {
      startDevServer(finalConfig, options);
      return;
    }

    portfinder.basePort = DEFAULT_PORT;
    portfinder.getPort((err, port) => {
      if (err) throw err;
      options.port = port;
      startDevServer(finalConfig, options);
    });

    function colorInfo(useColor, msg) {
      if (useColor) {
        // Make text blue and bold, so it *pops*
        return `\u001b[1m\u001b[34m${msg}\u001b[39m\u001b[22m`;
      }
      return msg;
    }

    function colorError(useColor, msg) {
      if (useColor) {
        // Make text red and bold, so it *pops*
        return `\u001b[1m\u001b[31m${msg}\u001b[39m\u001b[22m`;
      }
      return msg;
    }

    function startDevServer(webpackOptions, options) {
      addDevServerEntrypoints(webpackOptions, options);
      let compiler;
      try {
        compiler = webpack(webpackOptions);
      } catch (e) {
        if (e instanceof webpack.WebpackOptionsValidationError) {
          console.error(colorError(options.stats.colors, e.message));
          process.exit(1); // eslint-disable-line
        }
        throw e;
      }

      const suffix = options.inline !== false || options.lazy === true ? '/' : '/webpack-dev-server/';

      let server;
      try {
        server = new WebpackDevServer(compiler, options);
      } catch (e) {
        if (e instanceof OptionsValidationError) {
          console.error(colorError(options.stats.colors, e.message));
          process.exit(1); // eslint-disable-line
        }
        throw e;
      }

      ['SIGINT', 'SIGTERM'].forEach(sig => {
        process.on(sig, () => {
          server.close();
          process.exit(); // eslint-disable-line no-process-exit
        });
      });

      if (options.socket) {
        server.listeningApp.on('error', e => {
          if (e.code === 'EADDRINUSE') {
            const clientSocket = new net.Socket();
            clientSocket.on('error', clientError => {
              if (clientError.code === 'ECONNREFUSED') {
                // No other server listening on this socket so it can be safely removed
                fs.unlinkSync(options.socket);
                server.listen(options.socket, options.host, err => {
                  if (err) throw err;
                });
              }
            });
            clientSocket.connect({ path: options.socket }, () => {
              throw new Error('This socket is already used');
            });
          }
        });
        server.listen(options.socket, options.host, err => {
          if (err) throw err;
          // chmod 666 (rw rw rw)
          const READ_WRITE = 438;
          fs.chmod(options.socket, READ_WRITE, fsError => {
            if (fsError) throw fsError;
            const uri = createDomain(options, server.listeningApp) + suffix;
            reportReadiness(uri, options);
          });
        });
      } else {
        server.listen(options.port, options.host, err => {
          if (err) throw err;
          if (options.bonjour) broadcastZeroconf(options);
          const uri = createDomain(options, server.listeningApp) + suffix;
          reportReadiness(uri, options);
        });
      }
    }

    function reportReadiness(uri, options) {
      const useColor = true;
      const contentBase = Array.isArray(options.contentBase) ? options.contentBase.join(', ') : options.contentBase;

      if (!options.quiet) {
        let startSentence = `Project is running at ${colorInfo(useColor, uri)}`;
        if (options.socket) {
          startSentence = `Listening to socket at ${colorInfo(useColor, options.socket)}`;
        }

        console.log(`\n${startSentence}`);

        console.log(`webpack output is served from ${colorInfo(useColor, options.publicPath)}`);

        if (contentBase) {
          console.log(`Content not from webpack is served from ${colorInfo(useColor, contentBase)}`);
        }

        if (options.historyApiFallback) {
          console.log(
            `404s will fallback to ${colorInfo(useColor, options.historyApiFallback.index || '/index.html')}`,
          );
        }

        if (options.bonjour) {
          console.log('Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)');
        }
      }

      if (options.open) {
        let openOptions = {};
        let openMessage = 'Unable to open browser';

        if (typeof options.open === 'string') {
          openOptions = { app: options.open };
          openMessage += `: ${options.open}`;
        }

        open(uri + (options.openPage || ''), openOptions).catch(() => {
          console.log(`${openMessage}. If you are running in a headless environment, please do not use the open flag.`);
        });
      }
    }

    function broadcastZeroconf(options) {
      const bonjour = require('bonjour')();
      bonjour.publish({
        name: 'Webpack Dev Server',
        port: options.port,
        type: 'http',
        subtypes: ['webpack'],
      });
      process.on('exit', () => {
        bonjour.unpublishAll(() => {
          bonjour.destroy();
        });
      });
    }
  };
}
