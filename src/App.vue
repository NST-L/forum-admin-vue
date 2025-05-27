<template>
  <div id="app">
    <TopNavbar v-if="route.path !== '/login'" />
    <div v-if="route.path === '/login'">
      <router-view />
    </div>
    <div v-else-if="store.state.loggedIn">
      <div class="main-layout"> <!-- 新增布局容器 -->
        <div class="app-container">
          <Sidebar />
          <div class="main-content">
            <router-view />
          </div>
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
import TopNavbar from './components/TopNavbar.vue'; // 新增导入
import { inject } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'App',
  components: {
    Sidebar,
    TopNavbar, // 新增组件
  },
  setup() {
    const store = inject('store');
    const route = useRoute();
    return { store, route };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000000;
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 60px; /* 顶部导航栏高度补偿 */
  height: calc(100vh - 60px); /* 新增高度计算 */
}

.app-container {
  display: flex;
  flex: 1;
  overflow: visible;
  position: relative;
}


.main-content {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
  border-left: 1px solid #ccc; /* 添加左侧竖线 */

  /* 移动端适配 */
  @media (max-width: 768px) {
    margin-left: 0;
    border-left: none; /* 移动端不显示竖线 */
  }
}

/* 移动端响应式布局 */
@media (max-width: 768px) {
  .main-layout {
    margin-top: 0;
    height: 100vh; /* 移动端全屏高度 */
  }

  .app-container {
    flex-direction: column;
    height: auto; /* 自动高度适应内容 */
  }
}

</style>