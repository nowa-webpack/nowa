export { Component } from './Component';
export * from './resolver/util';
import { resolveProjectComponents, resolveComponentConfigs } from './resolver';
import { install } from 'source-map-support';

install();

export const runCLI = async ({ yargs }) => {
  const components = await resolveProjectComponents();
  const availableCommands = [];
  yargs.wrap(yargs.terminalWidth()).usage('$0 [command]');
  const versions = [`nowa-core ${__version__}`];
  components.forEach(c => {
    yargs.command(c.componentName, c.constructor.description);
    versions.push(`${c.packageName} ${c.packageJSON.version}`);
    availableCommands.push(c.componentName);
  });
  yargs
    .version('v', versions.join('\n'))
    .alias('v', 'version')
    .alias('h', 'help');

  const subCommand = yargs.argv._[0];
  const config = yargs.argv._[1];

  if (availableCommands.includes(subCommand)) {
    const component = components.find(c => c.componentName === subCommand);
    const newYargs = yargs.reset().wrap(yargs.terminalWidth());
    const argv = newYargs.argv;
    const availableConfigs = await resolveComponentConfigs(subCommand);
    global.__custom = argv.customFlag;
    availableConfigs.forEach(c => {
      newYargs.command(c.configName, `from ${c.from}`);
    });
    console.log(availableConfigs);
    newYargs.updateStrings({
      'Commands:': 'Configs: ',
    });
    component.constructor.initHelp({ yargs: newYargs });
    newYargs
      .option('customFlag', {
        alias: 'flag',
        describe: 'flag string, will be passed to config as __custom',
        type: 'string',
      })
      .option('noOverride', {
        type: 'boolean',
        describe: 'ignore ./nowa and use first',
      })
      .option('noMerge', {
        type: 'boolean',
        describe: 'treat ./nowa as an a complete config, do not merge it with next config',
      })
      .help('h')
      .alias('h', 'help');
    if (!argv.help) {
      const overrideConfig =
        availableConfigs[0] && availableConfigs[0].configName === '[override]' && availableConfigs[0];
      const packageConfig = config
        ? availableConfigs.find(c => c.configName === config)
        : availableConfigs[overrideConfig ? 1 : 0];
      if (!overrideConfig && !packageConfig) {
        console.error(`Can not find ${config || 'default'} config`);
        newYargs.showHelp();
      } else {
        !argv.noOverride && overrideConfig && console.log(`Using [override] from ${overrideConfig.from}`);
        !argv.noMerge &&
          packageConfig &&
          console.log(`Using config ${packageConfig.configName} from ${packageConfig.from}`);
        const instance = new component.constructor();
        const finalConfig = await instance.processConfig({ overrideConfig, packageConfig, argv });
        console.log(finalConfig);
        await instance.run({ finalConfig, argv });
      }
    } else {
      newYargs.showHelp();
    }
  } else {
    yargs.help('h');
    yargs.showHelp();
  }
};
