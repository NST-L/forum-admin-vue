<template>
  <!-- <button class="theme-toggle-btn" @click="toggleTheme">切换主题</button> -->
  <div id="app">
    <TopNavbar v-if="route.path !== '/login'" />
    <div v-if="route.path === '/login'">
      <router-view />
    </div>
    <div v-else-if="store.state.loggedIn">
      <div class="main-area">
        <Sidebar />
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import TopNavbar from './components/TopNavbar.vue';
import { inject } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'App',
  components: {
    Sidebar,
    TopNavbar,
  },
  setup() {
    const store = inject('store');
    const route = useRoute();
    return { store, route };
  }
};
</script>

<style>
/* CSS变量定义 - 统一配色方案 */
:root {
  --primary-color: #FF4500;
  --secondary-color: #0079D3;
  --background-color: #DAE0E6;
  --foreground-color: #1A1A1B;
  --foreground-muted: #666666;
  --card-bg: #FFFFFF;
  --border-color: #E5E5E5;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.12);
  --border-radius: 12px;
  --border-radius-sm: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: var(--background-color);
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--foreground-color);
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: var(--background-color);
}

.main-area {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  background: var(--background-color);
}

.main-content {
  flex: 1 1 auto;
  min-width: 0;
  width: calc(100vw - 240px);
  min-height: 0;
  height: calc(100vh - 60px);
  overflow-y: auto;
  box-sizing: border-box;
  background: var(--background-color);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-content {
    width: 100vw;
    margin-left: 0;
  }
  .main-area {
    flex-direction: column;
  }
}

/* 全局样式重置 */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease;
}

/* 移除全局输入框样式 - 避免与登录页面冲突 */

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-color);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--foreground-muted);
}
</style>