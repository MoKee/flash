const { resolve, parse } = require('path');
const { readdirSync, writeFileSync } = require('fs');

const content = readdirSync(resolve(__dirname, '../src/i18n'))
  .filter(file => file.endsWith('.json'))
  .map(file => `exports['${parse(file).name}'] = require('./${file}');`)
  .join('\n');

writeFileSync(resolve(__dirname, '../src/i18n/index.js'), content + '\n');
