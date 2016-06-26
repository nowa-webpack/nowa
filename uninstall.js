/*
* @Author: gbk
* @Date:   2016-06-26 10:38:07
* @Last Modified by:   gbk
* @Last Modified time: 2016-06-26 22:50:24
*/

'use strict';

var os = require('os');
var path = require('path');
var exec = require('child_process').exec;

var configRoot = path.join(os.homedir(), '.nowa');
var rimrafPath = path.join(configRoot, 'install', '.bin', 'rimraf');
exec('node ' + rimrafPath + ' ../nowa-* ' + configRoot);
