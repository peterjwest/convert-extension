# convert-extension [![npm version][npm-badge]][npm-url] [![build status][circle-badge]][circle-url] [![coverage status][coverage-badge]][coverage-url]

Convert JS source file extensions and imports.

This module was created to allow you to convert the output of Typescript to `.mjs` or `.cjs`, for better support with node ES6 modules.

## Installation

```bash
npm install convert-extension
```
or
```bash
yarn add convert-extension
```

## Usage

Run the command, providing a file extension (here `.mjs`) and a directory:

```bash
npx convert-extension mjs build/
```

This will convert any `.js` files and their relative imports to `.mjs`. It will also convert source maps, if they exist.


[npm-badge]: https://badge.fury.io/js/convert-extension.svg
[npm-url]: https://www.npmjs.com/package/convert-extension

[circle-badge]: https://circleci.com/gh/peterjwest/convert-extension.svg?style=shield
[circle-url]: https://circleci.com/gh/peterjwest/convert-extension

[coverage-badge]: https://coveralls.io/repos/peterjwest/convert-extension/badge.svg?branch=master&service=github
[coverage-url]: https://coveralls.io/github/peterjwest/convert-extension?branch=master
