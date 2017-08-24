import { Component } from '../Component';
import { tryRequire, briefProjectNowaPackageNamesPromise } from './util';

const resolveComponent = async (packagePath) => {
  const constructor = tryRequire(packagePath);
  if (constructor && Object.getPrototypeOf(constructor) === Component) {
    return constructor;
  }
  return undefined;
};

export const resolveProjectComponents = async () => {
  const { packages } = await briefProjectNowaPackageNamesPromise;
  const components = [];
  for (const p of packages) {
    const constructor = await resolveComponent(p.path);
    constructor && components.push({ constructor, ...p });
  }
  return components;
};

export const resolveGlobalComponents = async () => {
  // TODO
  return [];
};
