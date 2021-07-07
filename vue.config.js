const { DefinePlugin } = require('webpack');
const { join } = require('path');
const { readdirSync } = require('fs');

const LANGUAGES = readdirSync(join(__dirname, 'src', 'i18n'))
  .filter(name => name.endsWith('.json'))
  .map(name => name.replace(/\.json$/, ''));

module.exports = {
  configureWebpack: {
    plugins: [
      new DefinePlugin({
        'process.env.LANGUAGES': JSON.stringify(LANGUAGES),
      }),
    ],
  },
  transpileDependencies: [
    'vuetify',
  ],
}
