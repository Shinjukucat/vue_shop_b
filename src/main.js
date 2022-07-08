import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

import ElementUI from 'element-ui' //element-ui的全部组件
import 'element-ui/lib/theme-chalk/index.css'//element-ui的css
Vue.use(ElementUI) //使用elementUI

import axios from 'axios'
Vue.prototype.axios = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
