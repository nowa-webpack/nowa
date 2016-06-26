/*
* @Author: gbk
* @Date:   2016-06-25 17:44:38
* @Last Modified by:   gbk
* @Last Modified time: 2016-06-25 22:26:03
*/

'use strict';

var os = require('os');
var fs = require('fs');
var path = require('path');

var packageJson = require('package-json');

var configRoot = path.join(os.homedir(), '.nowa');
var versionsPath = path.join(configRoot, 'latest-versions.json');

// tasks definiation
var majorVersion = process.argv[2].split('.')[0];
var tasks = process.argv.slice(3).map(function(command) {
  return packageJson(command, majorVersion);
});
tasks.push(packageJson('nowa', 'latest'))
tasks.push(new Promise(function(resolve) {
  fs.mkdir(configRoot, resolve);
}));

// run tasks
new Promise(function(resolve, reject) {
  fs.readFile(versionsPath, 'utf-8', function(err, data) {
    if (data) {
      data = JSON.parse(data);

      // check interval by 1 day
      if (Date.now() - data.update > 3600000 * 24) {
        resolve(Promise.all(tasks));
      } else {
        reject();
      }
    } else {
      resolve(Promise.all(tasks));
    }
  });
}).then(function(pkgs) {

  // write to versions store
  var versions = {};
  pkgs.forEach(function(pkg) {
    versions[pkg.name] = pkg.version;
  });
  fs.writeFile(versionsPath, JSON.stringify({
    versions: versions,
    update: Date.now()
  }));
});
