const convertExtension = require('./es5/index.cjs');
module.exports = Object.assign(
    convertExtension.default,
    convertExtension,
);
