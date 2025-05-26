import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import UserManagement from './views/UserManagement.vue';
import ContentModeration from './views/ContentModeration.vue';
import DataDashboard from './views/DataDashboard.vue';
import ReportHandling from './views/ReportHandling.vue';

import store from './store.js'; // 导入 store

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/user-management',
        name: 'UserManagement',
        component: UserManagement,
        meta: { requiresAuth: true }
    },
    {
        path: '/content-moderation',
        name: 'ContentModeration',
        component: ContentModeration,
        meta: { requiresAuth: true }
    },
    {
        path: '/data-dashboard',
        name: 'DataDashboard',
        component: DataDashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/report-handling',
        name: 'ReportHandling',
        component: ReportHandling,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const isLoggedIn = store.state.loggedIn; // 使用 store 中的状态
    const token = store.state.token;
    // token 校验（这里只允许 mock-token-123，实际应后端校验）
    const isTokenValid = token === 'mock-token-123';

    if (to.meta.requiresAuth && (!isLoggedIn || !isTokenValid)) {
        store.logout(); // 清除无效token
        next({ name: 'Login' });
    } else {
        next();
    }
});

export default router;