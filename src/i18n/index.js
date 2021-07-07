for (const lang of process.env.LANGUAGES) {
  exports[lang] = require(`./${lang}.json`);
}
