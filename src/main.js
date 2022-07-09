import Vue from 'vue'
import App from './App'
import router from './router'
// 导入全局样式
import './assets/css/global.css'

// 导入字体图标
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false

import ElementUI from 'element-ui' //element-ui的全部组件
import 'element-ui/lib/theme-chalk/index.css'//element-ui的css
Vue.use(ElementUI) //使用elementUI

// 配置axios
import axios from 'axios'
// 配置根路径
axios.defaults.baseURL = 'http://47.108.251.106:8881/api/private/v1/'
// 下面这句可以实现每一个组件都可以通过this.$http发送ajax请求
Vue.prototype.$http = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
