import Vue from 'vue';
import VueI18n from 'vue-i18n';
import vuetify from './plugins/vuetify';

import App from './App.vue';

import messages from './i18n';
import selectLanguage from './utils/selectLanguage';

Vue.config.productionTip = false;

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: selectLanguage(Object.keys(messages), navigator.languages),
  fallbackLocale: 'en-US',
  messages,
});

new Vue({
  i18n,
  vuetify,
  render: h => h(App),
}).$mount('#app');
