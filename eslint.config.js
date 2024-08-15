/* eslint-disable @typescript-eslint/naming-convention */
const globalConfig = require('@jwpkg/eslint-config');

module.exports = [
  ...globalConfig,
  {
    files: ['**/package.json'],
    rules: {
      'eol-last': [2, 'always'],
    },
  },
];
