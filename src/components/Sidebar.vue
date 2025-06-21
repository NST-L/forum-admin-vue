<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path" 
        class="nav-item"
        :class="{ 'active': $route.path === item.path }"
      >
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-text">{{ item.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { defineComponent, h } from 'vue';

// SVG 图标组件
const HomeIcon = defineComponent({
  render: () => h('svg', { 
    width: '20', 
    height: '20', 
    viewBox: '0 0 24 24', 
    fill: 'currentColor' 
  }, [
    h('path', { d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' })
  ])
});

const UserIcon = defineComponent({
  render: () => h('svg', { 
    width: '20', 
    height: '20', 
    viewBox: '0 0 24 24', 
    fill: 'currentColor' 
  }, [
    h('path', { d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' })
  ])
});

const TagIcon = defineComponent({
  render: () => h('svg', { 
    width: '20', 
    height: '20', 
    viewBox: '0 0 24 24', 
    fill: 'currentColor' 
  }, [
    h('path', { d: 'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z' })
  ])
});

const CategoryIcon = defineComponent({
  render: () => h('svg', { 
    width: '20', 
    height: '20', 
    viewBox: '0 0 24 24', 
    fill: 'currentColor' 
  }, [
    h('path', { d: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z' })
  ])
});

const ViolationIcon = defineComponent({
  render: () => h('svg', { 
    width: '20', 
    height: '20', 
    viewBox: '0 0 24 24', 
    fill: 'currentColor' 
  }, [
    h('path', { d: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' })
  ])
});

const menuItems = [
  { name: '首页', path: '/', icon: HomeIcon },
  { name: '用户管理', path: '/user-management', icon: UserIcon },
  { name: '标签管理', path: '/tag-management', icon: TagIcon },
  { name: '分类管理', path: '/category-management', icon: CategoryIcon },
  { name: '用户举报', path: '/user-violation', icon: ViolationIcon },
  { name: '帖子举报', path: '/post-violation', icon: ViolationIcon },
  { name: '评论举报', path: '/comment-violation', icon: ViolationIcon }
];
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  height: calc(100vh - 60px);
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-nav {
  padding: var(--spacing-lg) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--foreground-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  margin: 2px 0;
}

.nav-item:hover {
  background: rgba(255, 69, 0, 0.08);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
}

.nav-item.active {
  background: rgba(255, 69, 0, 0.12);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
  font-weight: 600;
}

.nav-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
  opacity: 1;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    border-right: none;
    border-top: 1px solid var(--border-color);
    z-index: 50;
  }
  
  .sidebar-nav {
    display: flex;
    padding: var(--spacing-sm) 0;
    overflow-x: auto;
  }
  
  .nav-item {
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    min-width: 80px;
    text-align: center;
    border-left: none;
    border-top: 3px solid transparent;
  }
  
  .nav-item:hover,
  .nav-item.active {
    border-left-color: transparent;
    border-top-color: var(--primary-color);
  }
  
  .nav-text {
    font-size: 12px;
    white-space: nowrap;
  }
}
</style>