import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import DashboardView from '../views/DashboardView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'
import ChangePasswordView from '../views/ChangePasswordView.vue'
import GroupsView from '../views/GroupsView.vue'
import GroupDetailView from '../views/GroupDetailView.vue'
import GroupAttrView from '../views/GroupAttrView.vue'
import ProfileView from '../views/ProfileView.vue'
import EmployeesView from '../views/EmployeesView.vue'
import IncomeView from '../views/IncomeView.vue'
import { authStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { public: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/income',
      name: 'income',
      component: IncomeView,
      meta: { title: '收入記帳', permission: 'income' },
    },
    {
      path: '/expense',
      name: 'expense',
      component: PlaceholderView,
      meta: { title: '支出記帳', permission: 'expense' },
    },
    {
      path: '/payroll',
      name: 'payroll',
      component: PlaceholderView,
      meta: { title: '人員工資', permission: 'payroll' },
    },
    {
      path: '/projects',
      name: 'projects',
      component: PlaceholderView,
      meta: { title: '客戶工程', permission: 'projects' },
    },
    {
      path: '/reports',
      name: 'reports',
      component: PlaceholderView,
      meta: { title: '月報表', permission: 'reports' },
    },
    {
      path: '/audit-log',
      name: 'audit-log',
      component: PlaceholderView,
      meta: { title: '操作追蹤報表', permission: 'audit-log' },
    },
    {
      path: '/groups',
      name: 'groups',
      component: GroupsView,
      meta: { permission: 'groups' },
    },
    {
      path: '/groups/:groupId/detail',
      name: 'group-detail',
      component: GroupDetailView,
    },
    {
      path: '/groups/:groupId/attr',
      name: 'group-attr',
      component: GroupAttrView,
    },
    {
      path: '/employees',
      name: 'employees',
      component: EmployeesView,
      meta: { permission: 'employees' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: ChangePasswordView,
    },
  ],
})

router.beforeEach((to) => {
  const isLoggedIn = !!authStore.state.user

  // 未登入,擋掉非 public 頁面
  if (!to.meta.public && !isLoggedIn) {
    return { path: '/login' }
  }

  // 已登入卻硬要看 login 頁,直接導去大廳
  if (to.meta.public && isLoggedIn && to.name === 'login') {
    return { path: '/dashboard' }
  }

  // 頁面要求特定權限,但目前使用者沒有
  const requiredPermission = to.meta.permission as string | undefined
  if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
    return { path: '/dashboard' }
  }

  return true
})

export default router