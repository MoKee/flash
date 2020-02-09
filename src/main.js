import Vue from 'vue';
import VueI18n from 'vue-i18n';
import nearestLocale from 'detect-nearest-browser-locale';
import vuetify from './plugins/vuetify';

import App from './App.vue';
import messages from './i18n';

Vue.config.productionTip = false;

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: nearestLocale(Object.keys(messages)),
  fallbackLocale: 'en-US',
  messages,
});

new Vue({
  i18n,
  vuetify,
  render: h => h(App),
}).$mount('#app');
