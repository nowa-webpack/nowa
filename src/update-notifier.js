/*
* @Author: gbk
* @Date:   2016-06-25 12:42:56
* @Last Modified by:   gbk
* @Last Modified time: 2016-06-27 15:08:27
*/

'use strict';

var os = require('os');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var chalk = require('chalk');
var semver = require('semver');

module.exports = function() {

  // read latest versions
  var versionsFile = path.join(os.homedir(), '.nowa', 'latest-versions.json');
  var store = {};
  try {
    store = JSON.parse(fs.readFileSync(versionsFile, 'utf-8'));
  } catch(e) {}
  var versions = store.versions || {};

  // compare versions and show tip
  var isTipShow = false;
  var argvs = Array.prototype.slice.call(arguments, 0);
  argvs.slice(1).concat([ 'nowa' ]).forEach(function(plugin) {
    try {
      var pkg = require(path.join(__dirname, '..', '..', plugin, 'package.json'));
      if (versions[plugin] && semver.lt(pkg.version, versions[plugin])) {
        if (plugin === 'nowa') {

          // do not show nowa update tip if any plugins need update
          if (!isTipShow) {
            console.log(
              chalk.yellow(
                '\n  Update available: ' +
                plugin + '@' + versions[plugin] + ' (Current: ' + pkg.version + ')' +
                '\n  Run  `npm i nowa -g`  to update.')
              );
          }
        } else {
          console.log(
            chalk.yellow(
              '\n  Update available: ' +
              plugin + '@' + versions[plugin] + ' (Current: ' + pkg.version + ')' +
              '\n  Run  `nowa install ' + plugin.substring(5) + '`  to update.')
            );
        }
        isTipShow = true;
      }
    } catch(e) {
    }
  });

  // fetch latest versions
  spawn(process.execPath, [
    path.join(__dirname, 'check')
  ].concat(argvs), {
    detached: true,
    stdio: 'ignore'
  }).unref();
};
