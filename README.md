# nowa

[![NPM version](https://img.shields.io/npm/v/nowa.svg?style=flat)](https://npmjs.org/package/nowa)

nowa webpack solution

----

## Feature

- Generate a [webpack](https://github.com/webpack/webpack) based boilerplate.
- Run a local server for web developer, support proxy and HMR.
- Easy to use and customize third-party UI components.
- Support customized webpack.config.js.
- Support `buildvars` to automatically output bundles with different varible combinations.

Checkout [https://nowa-webpack.github.io/](https://nowa-webpack.github.io/) for more information.

## Install

- Install nowa

```bash
$ npm i nowa -g
```

- Install all frequently-used nowa plugins ([build](https://github.com/nowa-webpack/nowa-build), [init](https://github.com/nowa-webpack/nowa-init), [lib](https://github.com/nowa-webpack/nowa-lib), [server](https://github.com/nowa-webpack/nowa-server))

```bash
$ nowa install
```

> You can install any plugin by `nowa install <name>`.

> Find more plugins, visit [here](https://www.npmjs.com/search?q=nowa-).

## Usage

- Generate a boilerplate.

```bash
$ mkdir test && cd test
$ nowa init uxcore
```

- Start a local dev server.

```bash
$ nowa server
```

- Build project.

```bash
$ nowa build
```

- Build libraries.

```bash
$ nowa lib
```
