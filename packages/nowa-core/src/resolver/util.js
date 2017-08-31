import promisify from 'pify';
import npm from 'npm';
import { join } from 'path';
import { readdir } from 'fs';

export const get = (object, path) => {
  return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : undefined), object);
};

export const tryRequire = packagePath => {
  try {
    const config = eval('require')(packagePath);
    return config.default || config;
  } catch (e) {
    return undefined;
  }
};

export const projectInfoPromise = (async () => {
  const root = process.cwd();
  const result = {
    root,
    nodeModules: join(root, './node_modules'),
    packageJSON: tryRequire(join(root, './package.json')) || {},
  };
  global.__projroot = result.root;
  return result;
})();

export const globalInfoPromise = (async () => {
  const nodeModules = await new Promise(resolve => npm.load(() => resolve(npm.globalDir)));
  return {
    root: join(nodeModules, '../'),
    nodeModules,
  };
})();

export const toCamelCase = name => {
  const dashSplit = name.split('-');
  const stringArray = [];
  dashSplit.forEach(piece => {
    stringArray.push(...piece.split('_'));
  });
  return `${stringArray[0]}${stringArray
    .slice(1)
    .map(piece => `${piece[0].toUpperCase()}${piece.slice(1)}`)
    .join('')}`;
};

export const filterUndefined = (object = {}) => {
  const result = {};
  Object.entries(object).forEach(([k, v]) => {
    if (v !== undefined) {
      result[k] = v && typeof v === 'object' ? filterUndefined(v) : v;
    }
  });
  return result;
};

export const briefProjectNowaPackageNamesPromise = (async () => {
  const { packageJSON, nodeModules } = await projectInfoPromise;
  const configs = [];
  const packages = [];
  const getPackageNameRegExp = /^(@[a-z0-9\-_.]*\/)?([a-z0-9\-_.]*)$/;
  const devDependencies = packageJSON.devDependencies || {};
  const dependencies = packageJSON.dependencies || {};
  const judgeByName = (name, from) => {
    const nameWithoutScope = name.match(getPackageNameRegExp)[2];
    if (nameWithoutScope.startsWith('nowa-config-')) {
      !configs.find(c => c.packageName === name) &&
        configs.push({
          packageName: name,
          from,
          configName: nameWithoutScope.slice(12),
          path: join(nodeModules, name),
          packageJSON: tryRequire(join(nodeModules, name, 'package.json')),
        });
    } else if (
      nameWithoutScope.startsWith('nowa-') &&
      !nameWithoutScope.startsWith('nowa-core') &&
      !nameWithoutScope.startsWith('nowa-cli')
    ) {
      !packages.find(p => p.packageName === name) &&
        packages.push({
          packageName: name,
          from,
          componentName: nameWithoutScope.slice(5),
          path: join(nodeModules, name),
          packageJSON: tryRequire(join(nodeModules, name, 'package.json')),
        });
    }
  };
  Object.keys(devDependencies).forEach(name => judgeByName(name, 'devDependencies'));
  Object.keys(dependencies).forEach(name => judgeByName(name, 'dependencies'));

  const resolveInNodeModules = async () => {
    const findInFolder = async folderPath => {
      const subFolders = await promisify(readdir)(folderPath);
      const result = subFolders.filter(name => /^[a-z0-9\-_.]*$/.test(name));
      for (const scope of subFolders.filter(name => /^@[a-z0-9\-_.]*$/.test(name))) {
        const scopedPackages = await findInFolder(join(folderPath, `./${scope}`));
        result.push(...scopedPackages.map(name => `${scope}/${name}`));
      }
      return result;
    };
    return await findInFolder(nodeModules);
  };
  try {
    const packagesFromNodeModules = await resolveInNodeModules();
    packagesFromNodeModules.forEach(name => judgeByName(name, 'node_modules'));
  } catch (e) {
    // console.error(e);
  }
  return { configs, packages };
})();

export const briefGlobalNowaPackageNamesPromise = (async () => {
  return [];
})();
