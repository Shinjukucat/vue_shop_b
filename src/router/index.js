import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'
import Cate from '../components/goods/Cate'
import Params from '../components/goods/Params'
import List from '../components/goods/List'
import Add from '../components/goods/Add'
import Order from '../components/order/Order'
import Report from '../components/report/Report'

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
      component: Home,
      redirect: '/welcome',
      // 在home中嵌套一个路由
      children: [
        {
          path: '/welcome',
          name: 'Welcome',
          component: Welcome
        },
        {
          path: '/users',
          name: 'Users',
          component: Users
        },
        {
          path: '/rights',
          name: 'Rights',
          component: Rights
        },
        {
          path: '/roles',
          name: 'Roles',
          component: Roles
        },
        {
          path: '/categories',
          name: 'Cate',
          component: Cate
        },
        {
          path: '/params',
          name: 'Params',
          component: Params
        },
        {
          path: '/goods',
          name: 'List',
          component: List,
        },
        {
          path: '/goods/add',
          name: 'Add',
          component: Add
        },
        {
          path: '/orders',
          name: 'Order',
          component: Order
        },
        {
          path: '/reports',
          name: 'Report',
          component: Report
        }
      ]
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
