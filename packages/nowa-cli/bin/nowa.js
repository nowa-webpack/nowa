#!/usr/bin/env node
'use strict';

if (Number.parseInt(process.versions.node) < 6) {
  console.error(new Error('Nowa command needs node 6, please upgrade your environment'));
  process.exit(1);
}

const path = require('path');
const yargs = require('yargs');

// use local CLI to replace global one
try {
  const localNowaCLI = require.resolve(path.resolve(process.cwd(), './node_modules/nowa-cli/bin/nowa.js'));
  if (__filename !== localNowaCLI) {
    return require(localNowaCLI);
  }
} catch (e) {}

try {
  const { runCLI } = require('nowa-core');
  runCLI({ yargs }).catch(console.error);
} catch (e) {
  console.error('Can not resolve nowa-core in this project folder.\n Try  `npm i nowa-core@next -D` to install it');
}







