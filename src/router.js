// router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import UserManagement from './views/UserManagement.vue';
import UserViolation from './views/UserViolation.vue';
import PostViolation from './views/PostViolation.vue';  
import CommentViolation from './views/CommentViolation.vue';
import CategoryManagement from './views/CategoryManagement.vue';

import store from './store.js';

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
        path: '/report-handling',
        name: 'PostViolation',
        component: PostViolation,
        meta: { requiresAuth: true }
    },
    {
        path: '/user-violation',
        name: 'UserViolation',
        component: UserViolation,
        meta: { requiresAuth: true }
    },
    {
        path: '/comment-violation',
        name: 'CommentViolation',
        component: CommentViolation,
        meta: { requiresAuth: true }
    },
    {
        path: '/category-management',
        name: 'CategoryManagement',
        component: CategoryManagement,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = store.state.loggedIn;
    const token = store.state.token;
    // 只要有token就认为有效
    const isTokenValid = !!token;

    if (to.meta.requiresAuth && (!isLoggedIn || !isTokenValid)) {
        store.logout();
        next({ name: 'Login' });
    } else {
        next();
    }
});

export default router;
