#!/usr/bin/env node
const { resolve } = require('path');

require('ts-node').register({
  project: resolve(__dirname, '../tsconfig.json'),
});
require('../src/index');
