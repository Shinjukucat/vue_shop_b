import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'


Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      // 这个name写不写无所谓，不重要
      name: 'Login',
      component: Login
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    }
  ],
  mode: 'history'
})

// 在暴露路由对象之前给他挂载一个路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转过来
  // next 是一个函数，表示放行
  // next() 直接放行    next('/login')  强制跳转到login页面
  if(to.path === '/login')  return next()
  // 获取token，getItem函数里面的参数是sessionStorage里面的键
  const tokenStr = window.sessionStorage.getItem('token');
  if(!tokenStr) return next('/login')
  next()
})

// 挂载完再暴露路由对象
export default router;
