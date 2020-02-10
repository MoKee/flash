const { resolve, parse } = require('path')
const { readdirSync, writeFileSync } = require('fs')

const files = readdirSync(resolve(__dirname, '../src/i18n')).filter(file =>
  file.endsWith('.json')
)
const filenames = files.map(file => parse(file).name)

const content = filenames
  .map(name => `exports['${name}'] = require('./${name}.json');`)
  .join('\n')
writeFileSync(resolve(__dirname, '../src/i18n/index.js'), content)
