/*
* @Author: gbk
* @Date:   2016-04-11 16:43:10
* @Last Modified by:   gbk
* @Last Modified time: 2016-04-14 17:53:35
*/

'use strict';

var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var program = require('commander');
var chalk = require('chalk');

var argvs = process.argv;
var command = argvs[2];
var pkg = require('../package.json');

// dirs to find plugins
var globalModulesDir = path.join(__dirname, '..', '..');
var localModulesDir = path.join(__dirname, '..', 'node_modules');

// locate the plugin
var pluginPath = findPluginPath(command === 'help' ? argvs[3] : command);

program
    // .description(pkg.description)
    .version(pkg.version)
    .usage('<command> [options]');

if (pluginPath) { // plugin found

    // regist current plugin
    var pluginDef = require(pluginPath);
    var plugin = program.command(command);

    pluginDef.description && plugin.description(pluginDef.description);

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
        plugin.action(function(opts) {

            // abc.json options override
            for (var key in defauleOpts) {
                if (typeof opts[key] === 'undefined') {
                    opts[key] = defauleOpts[key];
                }
            }
            pluginDef.action.call(this, opts);
        });
    }

} else { // plugin not found

    // search and regist all the plugins
    var pluginSet = {};
    var localPlugins = fs.readdirSync(localModulesDir).filter(filter).forEach(function(name) {
        pluginSet[name.substring(5)] = path.join(localModulesDir, name, 'package.json');
    });
    var globalPlugins = fs.readdirSync(globalModulesDir).filter(filter).forEach(function(name) {
        pluginSet[name.substring(5)] = path.join(globalModulesDir, name, 'package.json');
    });
    for (var p in pluginSet) {
        var pluginPkg = require(pluginSet[p]);
        program.command(p, pluginPkg.description + chalk.green(' (v' + pluginPkg.version + ')'));
    }
}

// parse command line arguments
program.parse(argvs);

// locate the plugin by command
function findPluginPath(command) {
    if (command && /^\w+$/.test(command)) {
        try {
            return resolve.sync('nowa-' + command, {
                moduleDirectory: [
                    globalModulesDir,
                    localModulesDir,
                ]
            });
        } catch (e) {
            console.log('');
            console.log('  ' + chalk.green.bold(command) + ' command is not installed.');
            console.log('  You can try to install it by ' + chalk.blue.bold('npm install nowa-' + command + ' -g') + '.');
            console.log('');
        }
    }
}

// filter valid nowa plugin dirs
function filter(name) {
    return /^nowa\-\w+$/.test(name);
}

// load default options
function loadDefaultOpts(configFile) {
    try {
        return require(configFile).options;
    } catch (e) {
        return {};
    }
}
