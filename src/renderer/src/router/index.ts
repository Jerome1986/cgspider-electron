import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

// createRouter 创建路由实例，===> new VueRouter()
// 1. history模式: createWebHistory()   http://xxx/user
// 2. hash模式: createWebHashHistory()  http://xxx/#/user

// vite 的配置 import.meta.env.BASE_URL 是路由的基准地址，默认是 ’/‘
// https://vitejs.dev/guide/build.html#public-base-path

// 如果将来你部署的域名路径是：http://xxx/my-path/user
// vite.config.ts  添加配置  base: my-path，路由这就会加上 my-path 前缀了

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginPage.vue')
    },

    // 主应用布局路由
    {
      path: '/',
      name: 'Source',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/model', // 进入/source时默认显示model
      children: [
        {
          path: '/model',
          name: 'Model',
          component: () => import('@/views/model/ModelPage.vue')
        },
        {
          path: '/maps',
          name: 'Maps',
          component: () => import('@/views/maps/MapsPage.vue')
        },
        {
          path: '/lighting',
          name: 'Lighting',
          component: () => import('@/views/lighting/LightingPage.vue')
        },
        {
          path: '/material',
          name: 'Material',
          component: () => import('@/views/material/MaterialPage.vue')
        },
        // 会员产品页面
        {
          path: '/vipProduct',
          nam: 'VipProduct',
          component: () => import('@/views/vipProduct/VipProduct.vue')
        }
      ]
    }
  ]
})

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  if (!userStore.userInfo.token && to.name !== 'Login' && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
