#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const { runCLI } = require('nowa-core');

if (Number.parseInt(process.versions.node) < 6) {
  console.error(new Error('Nowa command needs node 6, please upgrade your environment'));
  process.exit(1);
}
// use local CLI to replace global one
try {
  const localNowaCLI = require.resolve(path.join(process.cwd(), 'node_modules', 'nowa-cli', 'bin', 'nowa.js'));
  if (__filename !== localNowaCLI) {
    return require(localNowaCLI);
  }
} catch (e) {}

runCLI({ yargs }).catch(console.error);


