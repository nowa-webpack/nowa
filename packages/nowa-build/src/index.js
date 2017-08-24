import webpack from 'webpack';
import { Component } from 'nowa-core';

export default class Build extends Component {

  static description = 'compile your project to a bundle';

  static initHelp = async ({ yargs }) => {
    // TODO
    yargs
      .usage('$0 Build')
      .option('TODO', {
        alias: 't',
        describe: 'TODO',
      })
      .option('TODO2', {
        alias: 't2',
        describe: 'TODO2',
      })
    ;
  };

  run = async () => {
    // TODO
    const compiler = webpack(this.config);
    let lastHash;
    compiler.run((err, stats) => {
      if (err) {
        compiler.purgeInputFileSystem();
        lastHash = null;
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        process.exit(1);
      }
      if (stats.hash !== lastHash) {
        lastHash = stats.hash;
        var statsString = stats.toString();
        if (statsString)
          process.stdout.write(statsString + '\n');
      }
    });
  };

};
