import Vue from 'vue'
import App from './App'
import router from './router'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入树形表格
import TreeTable from 'vue-table-with-tree-grid'

Vue.config.productionTip = false


// 导入elementui
import ElementUI from 'element-ui' //element-ui的全部组件
import 'element-ui/lib/theme-chalk/index.css'//element-ui的css

// 导入NProgress的包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置axios
import axios from 'axios'
// 配置根路径
// axios.defaults.baseURL = 'http://47.108.251.106:8881/api/private/v1/'
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 在将axios挂载到原型对象上之前，给他设置一个拦截器
// use里面的config就是请求对象，里面包含data、headers等等数据
// 在request拦截器里加入进度条，就是在发请求的时候展示进度条
axios.interceptors.request.use(config => {
  NProgress.start();
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 在把config请求对象拦截下来后一定要将他return返回回去
  return config;
})

// 在response拦截器里去除进度条，就是在请求完毕，服务器响应数据的时候将进度条关闭
axios.interceptors.response.use(config => {
  NProgress.done();
  return config;
})

// 下面这句可以实现每一个组件都可以通过this.$http发送ajax请求，即将axios挂载到原型对象上
Vue.prototype.$http = axios


// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require style 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


//注册elementUI为全局可用组件
Vue.use(ElementUI)
// 注册树形表格为全局可用组件
Vue.component('tree-table', TreeTable)
// 注册富文本编辑器为全局可用组件
Vue.use(ElementUI) //使用elementUI
Vue.use(VueQuillEditor)


// 定义一个处理事件的过滤器，将请求到到ms都转换成年月日时分秒
Vue.filter('dateFormat', function(originDate) {
  const dt = new Date(originDate);

  const year = dt.getFullYear();
  const month = (dt.getMonth() + 1 + '').padStart(2, '0');
  const day = (dt.getDate() + '').padStart(2, '0');

  const hour = (dt.getHours() + '').padStart(2, '0');
  const minutes = (dt.getMinutes() + '').padStart(2, '0');
  const second = (dt.getSeconds() + '').padStart(2, '0');

  return `${year}-${month}-${day}  ${hour}:${minutes}:${second}`;
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
