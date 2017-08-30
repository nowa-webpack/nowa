export class Component {
  static description = "DEMO, Override this meg in your component's description";

  static initHelp = async ({ yargs }) => {
    yargs.usage('$0 <unknown>');
  };

  constructor({ aliasConfig, config, configFunc }) {
    this.aliasConfig = aliasConfig;
    this.config = config;
    this.configFunc = configFunc;
  }

  run = async () => {
    console.log('a', this.aliasConfig);
    console.log('c', this.config);
    console.log('f', this.configFunc);
    console.log('DEMO Component is running');
  };
}
