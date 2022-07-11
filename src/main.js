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
// 在将axios挂载到原型对象上之前，给他设置一个拦截器
// use里面的config就是请求对象，里面包含data、headers等等数据
axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 在把config请求对象拦截下来后一定要将他return返回回去
  return config;
})
// 下面这句可以实现每一个组件都可以通过this.$http发送ajax请求，即将axios挂载到原型对象上
Vue.prototype.$http = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
