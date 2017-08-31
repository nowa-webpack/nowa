import { resolve } from 'path';
import { tryRequire, get, toCamelCase, briefProjectNowaPackageNamesPromise, projectInfoPromise } from './util';

const nowaConfigNames = [
  './nowa', // 处理文件报错，需要提醒
  './nowa.config',
  './nowa.config.babel',
];

const resolveConfig = async (packagePath, componentName) => {
  const configPackage = tryRequire(packagePath);
  if (configPackage) {
    const alias = get(configPackage, ['nowa', componentName]);
    const config = configPackage[componentName] || configPackage[toCamelCase(componentName)];
    // const configFunc = configPackage[`${componentName}Func`] || configPackage[`${componentName}Function`];
    return alias || config ? { alias, config } : undefined;
  }
  return undefined;
};

export const resolveComponentConfigs = async componentName => {
  const { root } = await projectInfoPromise;
  const configsFromConfigFile = nowaConfigNames.map(name => ({
    path: resolve(root, name),
    configName: '[override]',
    packageName: name,
    from: `${name} [will be merged with next one]`,
  }));
  const { configs: configsFromPackages } = await briefProjectNowaPackageNamesPromise;
  const configPackages = configsFromConfigFile.concat(configsFromPackages);
  const configs = [];
  for (const c of configPackages) {
    const config = await resolveConfig(c.path, componentName);
    config && configs.push({ ...config, ...c });
  }
  return configs;
};
