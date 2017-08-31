export class Component {
  static description = "DEMO, Override this meg in your component's description";

  static initHelp = async ({ yargs }) => {
    yargs.usage('$0 <unknown>');
  };

  processConfig = async ({ overrideConfig, packageConfig }) => {
    return packageConfig;
  };

  run = async ({ finalConfig }) => {
    console.log('DEMO Component');
    console.log('Final Config: ', finalConfig);
  };
}
