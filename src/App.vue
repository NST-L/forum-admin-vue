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
#app {
  /* 整个应用的根容器，设置整体字体，字体抗锯齿效果，字体颜色和布局 */
  font-family: Avenir, Helvetica, Arial, sans-serif; /* 字体族，优先使用 Avenir */
  -webkit-font-smoothing: antialiased; /* 使字体在webkit内核浏览器上平滑 */
  -moz-osx-font-smoothing: grayscale;  /* 使字体在Firefox（macOS）上平滑 */
  color: #000000; /* 文字颜色为黑色 */
  margin: 0; /* 去除默认外边距 */
  padding: 0; /* 去除默认内边距 */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-area {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}

.main-content {
  flex: 1 1 auto;
  min-width: 0;
  width: calc(100vw - 240px);
  min-height: 0;
  height: calc(100vh - 60px); /* 60px为顶部栏高度 */
  overflow-y: auto;
  box-sizing: border-box;
}

/* 响应式布局：当屏幕宽度小于等于768px时 */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    border-left: none;
  }
  .main-area {
    flex-direction: column;
    height: auto;
  }
}

html, body, #app {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  /* 不设置overflow，不设置height */
}

body {
  background: rgb(108, 119, 131);
  background-size: cover;
  transition: background 0.4s;
}

</style>