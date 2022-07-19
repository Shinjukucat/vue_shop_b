import Vue from 'vue'
import Router from 'vue-router'
// 路由懒加载写法
const Login = () => import('../components/Login')
const Home = () => import('../components/Home')
const Welcome = () => import('../components/Welcome')
const Users = () => import('../components/user/Users')
const Rights = () => import('../components/power/Rights')
const Roles = () => import('../components/power/Roles')
const Cate = () => import('../components/goods/Cate')
const Params = () => import('../components/goods/Params')
const List = () => import('../components/goods/List')
const Add = () => import('../components/goods/Add')
const Order = () => import('../components/order/Order')
const Report = () => import('../components/report/Report')

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

// 在暴露路由对象之前给他挂载一个路由导航守卫，检查是否携带token值
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
