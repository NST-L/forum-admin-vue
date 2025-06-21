// router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import UserManagement from './views/UserManagement.vue';
import UserViolation from './views/UserViolation.vue';
import PostViolation from './views/PostViolation.vue';  
import CommentViolation from './views/CommentViolation.vue';
import CategoryManagement from './views/CategoryManagement.vue';
import TagManagement from './views/TagManagement.vue';

import store from './store.js';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true , title: 'OpenShare·社区管理'}
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { title: 'OpenShare·登录' }
    },
    {
        path: '/user-management',
        name: 'UserManagement',
        component: UserManagement,
        meta: { requiresAuth: true , title: 'OpenShare·用户管理'}
    },
    {
        path: '/post-violation',
        name: 'PostViolation',
        component: PostViolation,
        meta: { requiresAuth: true , title: 'OpenShare·帖子违规管理'}
    },
    {
        path: '/user-violation',
        name: 'UserViolation',
        component: UserViolation,
        meta: { requiresAuth: true , title: 'OpenShare·用户违规管理'}
    },
    {
        path: '/comment-violation',
        name: 'CommentViolation',
        component: CommentViolation,
        meta: { requiresAuth: true , title: 'OpenShare·评论违规管理'}
    },
    {
        path: '/category-management',
        name: 'CategoryManagement',
        component: CategoryManagement,
        meta: { requiresAuth: true , title: 'OpenShare·分类管理'}
    },
    {
        path: '/tag-management',
        name: 'TagManagement',
        component: TagManagement,
        meta: { requiresAuth: true , title: 'OpenShare·标签管理'}
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    console.log(`[路由守卫] 从 ${from.path} 跳转到 ${to.path}`);
    
    // 动态设置页面标题
    if (to.meta && to.meta.title) {
        document.title = to.meta.title;
    } else {
        document.title = 'OpenShare·云社'; // 默认标题
    }

    // 检查是否需要认证
    if (to.meta.requiresAuth) {
        // 使用store中的loggedIn状态（从localStorage恢复的状态）
        const isLoggedIn = store.state.loggedIn;  // 修复：使用正确的状态名
        const userInfo = store.state.userInfo;
        
        console.log(`[路由守卫] 检查登录状态: loggedIn=${isLoggedIn}, userInfo存在=${!!userInfo}`);
        console.log(`[路由守卫] LocalStorage状态: isLoggedIn=${localStorage.getItem('isLoggedIn')}, userInfo存在=${!!localStorage.getItem('userInfo')}`);
        
        if (!isLoggedIn || !userInfo || Object.keys(userInfo).length === 0) {
            console.log('[路由守卫] 未登录，跳转到登录页');
            // 清除所有登录状态
            store.logout();
            next({ name: 'Login' });
            return;
        }
        
        // 检查用户角色（管理员权限）
        // 注意：后端LoginVO没有role字段，但我们通过adminLogin接口登录，说明已经是管理员
        // 如果需要严格检查，可以添加获取用户角色的API调用
        console.log(`[路由守卫] 用户信息:`, userInfo);
        
        // 暂时跳过角色检查，因为adminLogin接口已经验证了管理员身份
        // if (userInfo.role !== 1) {
        //     console.log(`[路由守卫] 用户角色检查失败: role=${userInfo.role}, 需要role=1(管理员)`);
        //     alert('您不是管理员，无权访问管理平台');
        //     store.logout();
        //     next({ name: 'Login' });
        //     return;
        // }
        
        console.log('[路由守卫] 认证通过，允许访问');
    }
    
    next();
});

export default router;
