/*
* @Author: gbk
* @Date:   2016-04-11 16:43:10
* @Last Modified by:   gbk
* @Last Modified time: 2016-05-17 11:44:33
*/

'use strict';

var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var program = require('commander');
var chalk = require('chalk');

var pkg = require('../package.json');
var argvs = process.argv;
var command = argvs[2];

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

  // regist current plugin
  var pluginDef = require(pluginPath);
  var plugin = program.command(pluginDef.command || command);

  if (pluginDef.description) {
    plugin.description(pluginDef.description);
  }

  // set options
  if (pluginDef.options) {
    pluginDef.options.forEach(function(optArgs) {
      plugin.option.apply(plugin, optArgs);
    });
  }

  // set action
  if (pluginDef.action) {

    // default options in abc.json
    var defauleOpts = loadDefaultOpts(path.join(process.cwd(), 'abc.json'));
    plugin.action(function(cmd, opts) {
      if (cmd instanceof program.Command) {
        opts = cmd;
        cmd = '';
      }
      opts = opts || {};

      // abc.json options override
      for (var key in defauleOpts) {
        if (typeof opts[key] === 'undefined') {
          opts[key] = defauleOpts[key];
        }
      }

      // run plugin action
      if (cmd) {
        pluginDef.action.call(this, cmd, opts);
      } else {
        pluginDef.action.call(this, opts);
      }
    });
  }

} else { // plugin not found

  var pluginPool = {};
  moduleDirs.forEach(function(modulesDir) {

    // search and regist all the plugins
    fs.readdirSync(modulesDir).filter(function(name) {

      // filter by name
      return /^nowa\-\w+$/.test(name);

    }).forEach(function(name) {

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
        moduleDirectory: moduleDirs
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
function loadDefaultOpts(configFile) {
  try {
    return require(configFile).options;
  } catch (e) {
    return {};
  }
}
