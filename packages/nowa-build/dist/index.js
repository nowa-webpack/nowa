module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../packages/nowa-build/src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../packages/nowa-build/src/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_webpack__ = __webpack_require__("webpack");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_webpack___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_webpack__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_nowa_core__ = __webpack_require__("nowa-core");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_nowa_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_nowa_core__);
function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }




class Build extends __WEBPACK_IMPORTED_MODULE_1_nowa_core__["Component"] {
  constructor(...args) {
    var _temp, _this;

    return _temp = _this = super(...args), this.run = _asyncToGenerator(function* () {
      // TODO
      const compiler = __WEBPACK_IMPORTED_MODULE_0_webpack___default()(_this.config);
      let lastHash;
      compiler.run(function (err, stats) {
        if (err) {
          compiler.purgeInputFileSystem();
          lastHash = null;
          console.error(err.stack || err);
          if (err.details) console.error(err.details);
          process.exit(1);
        }
        if (stats.hash !== lastHash) {
          lastHash = stats.hash;
          var statsString = stats.toString();
          if (statsString) process.stdout.write(statsString + '\n');
        }
      });
    }), _temp;
  }

}
/* harmony export (immutable) */ __webpack_exports__["default"] = Build;
Build.description = 'compile your project to a bundle';

Build.initHelp = (() => {
  var _ref2 = _asyncToGenerator(function* ({ yargs }) {
    // TODO
    yargs.usage('$0 Build').option('TODO', {
      alias: 't',
      describe: 'TODO'
    }).option('TODO2', {
      alias: 't2',
      describe: 'TODO2'
    });
  });

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
})();

;

/***/ }),

/***/ "nowa-core":
/***/ (function(module, exports) {

module.exports = require("nowa-core");

/***/ }),

/***/ "webpack":
/***/ (function(module, exports) {

module.exports = require("webpack");

/***/ })

/******/ });