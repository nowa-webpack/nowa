// export { Component } from './Component';
// import { resolveProjectComponents, resolveComponentConfigs } from './resolver';
//
// export const runCLI = async ({ yargs }) => {
//   const components = await resolveProjectComponents();
//   const availableCommands = [];
//   yargs.usage('$0 [command]');
//
//   components.forEach(c => {
//     yargs.command(c.componentName, c.constructor.description);
//     availableCommands.push(c.componentName);
//   });
//
//   const subCommand = yargs.argv._[0];
//   const config = yargs.argv._[1];
//   if (availableCommands.includes(subCommand)) {
//     const component = components.find(c => c.componentName === subCommand);
//     const availableConfigs = await resolveComponentConfigs(subCommand);
//     const newYargs = yargs.reset();
//     availableConfigs.forEach(c => {
//       newYargs.command(c.configName, `from ${c.from}`);
//     });
//     newYargs.locale('').updateStrings({
//       'Commands:': 'Configs: ',
//     });
//     component.constructor.initHelp({ yargs: newYargs });
//     newYargs.help('h').alias('h', 'help');
//     if (!newYargs.argv.help) {
//       const selectedConfig = config ? availableConfigs.find(c => c.configName === config) : availableConfigs[0];
//       if (!selectedConfig) {
//         console.error(`Can not find config ${config || 'default'}`);
//         newYargs.showHelp();
//       } else {
//         const instance = new component.constructor(selectedConfig);
//         await instance.run();
//       }
//     }
//   } else {
//     yargs.showHelp();
//   }
// };
