import webpack from "webpack";
import bonjour from "bonjour";
import portfinder from "portfinder";
import WebpackDevServer from "webpack-dev-server";
import addDevServerEntrypoints from "webpack-dev-server/lib/util/addDevServerEntrypoints";
import createDomain from "webpack-dev-server/lib/util/createDomain";
import OptionsValidationError from "webpack-dev-server/lib/OptionsValidationError";
import { Component } from "nowa-core";

export default class Server extends Component {
  static description = "start a server and serve your project for dev";

  static initHelp = async ({ yargs }) => {
    // TODO
    yargs
      .usage("$0 Server")
      .option("TODO", {
        alias: "t",
        describe: "TODO"
      })
      .option("TODO2", {
        alias: "t2",
        describe: "TODO2"
      });
  };

  run = async () => {
    const argv = {};
    function versionInfo() {
      return (
        `webpack-dev-server ${require("../package.json").version}\n` +
        `webpack ${require("webpack/package.json").version}`
      );
    }

    function colorInfo(useColor, msg) {
      if (useColor)
        // Make text blue and bold, so it *pops*
        return `\u001b[1m\u001b[34m${msg}\u001b[39m\u001b[22m`;
      return msg;
    }

    function colorError(useColor, msg) {
      if (useColor)
        // Make text red and bold, so it *pops*
        return `\u001b[1m\u001b[31m${msg}\u001b[39m\u001b[22m`;
      return msg;
    }

    var wpOpt = this.config;
    const DEFAULT_PORT = 8080;

    function processOptions(wpOpt) {
      if (typeof wpOpt.then === "function") {
        wpOpt.then(processOptions).catch(function(err) {
          console.error(err.stack || err);
          process.exit(); // eslint-disable-line
        });
        return;
      }

      const firstWpOpt = Array.isArray(wpOpt) ? wpOpt[0] : wpOpt;

      const options = wpOpt.devServer || firstWpOpt.devServer || {};

      if (!options.publicPath) {
        options.publicPath =
          (firstWpOpt.output && firstWpOpt.output.publicPath) || "";
        if (
          !/^(https?:)?\/\//.test(options.publicPath) &&
          options.publicPath[0] !== "/"
        )
          options.publicPath = `/${options.publicPath}`;
      }

      if (!options.filename)
        options.filename = firstWpOpt.output && firstWpOpt.output.filename;

      if (!options.watchOptions) options.watchOptions = firstWpOpt.watchOptions;

      if (options.contentBase === undefined) {
        if (argv["content-base"]) {
          options.contentBase = argv["content-base"];
          if (Array.isArray(options.contentBase)) {
            options.contentBase = options.contentBase.map(function(val) {
              return path.resolve(val);
            });
          } else if (/^[0-9]$/.test(options.contentBase))
            options.contentBase = +options.contentBase;
          else if (!/^(https?:)?\/\//.test(options.contentBase))
            options.contentBase = path.resolve(options.contentBase);
          // It is possible to disable the contentBase by using `--no-content-base`, which results in arg["content-base"] = false
        } else if (argv["content-base"] === false) {
          options.contentBase = false;
        }
      }

      if (!options.stats) {
        options.stats = {
          cached: false,
          cachedAssets: false
        };
      }

      if (options.open && !options.openPage) options.openPage = "";

      // Kind of weird, but ensures prior behavior isn't broken in cases
      // that wouldn't throw errors. E.g. both argv.port and options.port
      // were specified, but since argv.port is 8080, options.port will be
      // tried first instead.
      options.port = options.port || DEFAULT_PORT;
      if (options.port != null) {
        startDevServer(wpOpt, options);
        return;
      }

      portfinder.basePort = DEFAULT_PORT;
      portfinder.getPort(function(err, port) {
        if (err) throw err;
        options.port = port;
        startDevServer(wpOpt, options);
      });
    }

    function startDevServer(wpOpt, options) {
      addDevServerEntrypoints(wpOpt, options);

      let compiler;
      try {
        compiler = webpack(wpOpt);
      } catch (e) {
        if (e instanceof webpack.WebpackOptionsValidationError) {
          console.error(colorError(options.stats.colors, e.message));
          process.exit(1); // eslint-disable-line
        }
        throw e;
      }

      const uri =
        createDomain(options) +
        (options.inline !== false || options.lazy === true
          ? "/"
          : "/webpack-dev-server/");

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

      ["SIGINT", "SIGTERM"].forEach(function(sig) {
        process.on(sig, function() {
          server.close();
          process.exit(); // eslint-disable-line no-process-exit
        });
      });

      if (options.socket) {
        server.listeningApp.on("error", function(e) {
          if (e.code === "EADDRINUSE") {
            const clientSocket = new net.Socket();
            clientSocket.on("error", function(e) {
              if (e.code === "ECONNREFUSED") {
                // No other server listening on this socket so it can be safely removed
                fs.unlinkSync(options.socket);
                server.listen(options.socket, options.host, function(err) {
                  if (err) throw err;
                });
              }
            });
            clientSocket.connect({ path: options.socket }, function() {
              throw new Error("This socket is already used");
            });
          }
        });
        server.listen(options.socket, options.host, function(err) {
          if (err) throw err;
          const READ_WRITE = 438; // chmod 666 (rw rw rw)
          fs.chmod(options.socket, READ_WRITE, function(err) {
            if (err) throw err;
            reportReadiness(uri, options);
          });
        });
      } else {
        server.listen(options.port, options.host, function(err) {
          if (err) throw err;
          if (options.bonjour) broadcastZeroconf(options);
          reportReadiness(uri, options);
        });
      }
    }

    function reportReadiness(uri, options) {
      const useColor = argv.color;
      const contentBase = Array.isArray(options.contentBase)
        ? options.contentBase.join(", ")
        : options.contentBase;

      if (!options.quiet) {
        let startSentence = `Project is running at ${colorInfo(useColor, uri)}`;
        if (options.socket) {
          startSentence = `Listening to socket at ${colorInfo(
            useColor,
            options.socket
          )}`;
        }
        console.log((argv["progress"] ? "\n" : "") + startSentence);

        console.log(
          `webpack output is served from ${colorInfo(
            useColor,
            options.publicPath
          )}`
        );

        if (contentBase)
          console.log(
            `Content not from webpack is served from ${colorInfo(
              useColor,
              contentBase
            )}`
          );

        if (options.historyApiFallback)
          console.log(
            `404s will fallback to ${colorInfo(
              useColor,
              options.historyApiFallback.index || "/index.html"
            )}`
          );

        if (options.bonjour)
          console.log(
            'Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)'
          );
      }
      if (options.open) {
        open(uri + options.openPage).catch(function() {
          console.log(
            "Unable to open browser. If you are running in a headless environment, please do not use the open flag."
          );
        });
      }
    }

    function broadcastZeroconf(options) {
      const bonjour = require("bonjour")();
      bonjour.publish({
        name: "Webpack Dev Server",
        port: options.port,
        type: "http",
        subtypes: ["webpack"]
      });
      process.on("exit", function() {
        bonjour.unpublishAll(function() {
          bonjour.destroy();
        });
      });
    }

    processOptions(wpOpt);
  };
}
