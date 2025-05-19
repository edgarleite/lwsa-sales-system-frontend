import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { guest: true }
  },
  // Rotas de Vendedores
  {
    path: '/sellers',
    name: 'SellersList',
    component: () => import('../views/sellers/SellersListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sellers/create',
    name: 'SellerCreate',
    component: () => import('../views/sellers/SellerCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sellers/:id/edit',
    name: 'SellerEdit',
    component: () => import('../views/sellers/SellerEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sellers/:id/sales',
    name: 'SalesBySeller',
    component: () => import('../views/sellers/SalesBySellerView.vue'),
    meta: { requiresAuth: true }
  },
  // Rotas de Vendas
  {
    path: '/sales',
    name: 'SalesList',
    component: () => import('../views/sales/SalesListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sales/create',
    name: 'SalesCreate',
    component: () => import('../views/sales/SalesCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sales/:id/edit',
    name: 'SalesEdit',
    component: () => import('../views/sales/SalesEditView.vue'),
    meta: { requiresAuth: true }
  },
  // Rotas de Administração
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('../views/admin/AdminReportsView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      next({ name: 'Dashboard' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
