/*
* @Author: gbk
* @Date:   2016-04-11 16:43:10
* @Last Modified by:   gbk
* @Last Modified time: 2017-03-23 21:33:26
*/

'use strict';

var fs = require('fs');
var path = require('path');

var resolve = require('resolve');
var program = require('commander');
var chalk = require('chalk');
var semver = require('semver');

var updateNotifier = require('./update-notifier');
var pkg = require('../package.json');
var argvs = process.argv;
var command = argvs[2];

// check nodejs version
if (!semver.satisfies(process.version, pkg.engines.node)) {
  console.log(chalk.red.bold('Require nodejs version ' + pkg.engines.node + ', current ' + process.version));
  console.log('Download the latest nodejs here ' + chalk.green('https://nodejs.org/en/download/'));
  process.exit();
}

// program definiation
program
  .version(pkg.version)
  .usage('<command> [options]');

// dirs to find plugins
var moduleDirs = [
  path.join(__dirname, '..', 'node_modules'),
  path.join(__dirname, '..', '..')
];
program._moduleDirs = moduleDirs;

// locate the plugin
var pluginPath = findPluginPath(command);

if (pluginPath) { // plugin found

  // check update of current command
  updateNotifier(pkg.version, 'nowa-' + command);

  // regist current plugin
  var pluginDef = require(pluginPath);
  var plugin = program.command(pluginDef.command || command);

  if (pluginDef.description) {
    plugin.description(pluginDef.description);
  }

  // set options
  if (pluginDef.options) {

    // default options in abc.json
    var defaultOpts = loadDefaultOpts(process.cwd(), 'abc.json');
    var optNameReg = /\-\-(\w+)/;
    pluginDef.options.forEach(function(optArgs) {
      if (optArgs) {
        plugin.option.apply(plugin, optArgs);

        // replace default value with options in abc.json
        var matches = optNameReg.exec(optArgs[0]);
        if (matches && matches[1] in defaultOpts) {
          plugin[matches[1]] = defaultOpts[matches[1]]
        }
      }
    });
  }

  // set action
  if (pluginDef.action) {
    plugin.action(function(cmd, opts) {
      if (cmd instanceof program.Command) {
        opts = cmd;
        cmd = '';
      }
      opts = opts || {};

      // run plugin action
      if (cmd) {
        pluginDef.action.call(this, cmd, opts);
      } else {
        pluginDef.action.call(this, opts);
      }
    });
  }

} else if (!command) { // plugin not found

  var plugins;
  var pluginPool = {};
  moduleDirs.forEach(function(modulesDir, index) {

    // search plugins
    plugins = fs.readdirSync(modulesDir).filter(function(name) {

      // filter by name
      return /^nowa\-\w+$/.test(name);
    });

    // regist all the plugins
    plugins.forEach(function(name) {

      // ensure local plugins not be overridden
      if (!pluginPool[name]) {
        pluginPool[name] = true;

        // regist a plugin for help
        var pluginPkg = require(path.join(modulesDir, name, 'package.json'));
        program
          .command(name.substring(5))
          .description(pluginPkg.description + chalk.green(' (v' + pluginPkg.version + ')'));
      }
    });
  });

  // check update of all plugins
  updateNotifier.apply(null, [ pkg.version ].concat(plugins));
}

// parse command line arguments
program.parse(argvs);

// output help if no argv specified
if (!argvs.slice(2).length) {
  program.outputHelp();
}

// locate the plugin by command
function findPluginPath(command) {
  if (command && /^\w+$/.test(command)) {
    try {
      return resolve.sync('nowa-' + command, {
        paths: moduleDirs
      });
    } catch (e) {
      console.log('');
      console.log('  ' + chalk.green.bold(command) + ' command is not installed.');
      console.log('  You can try to install it by ' + chalk.blue.bold('nowa install ' + command) + '.');
      console.log('');
    }
  }
}

// load default options
function loadDefaultOpts(startDir, configFile) {
  try {
    return require(path.join(startDir, configFile)).options || {};
  } catch (e) {
    var dir = path.dirname(startDir);
    if (dir === startDir) {
      return {};
    }
    return loadDefaultOpts(dir, configFile);
  }
}
