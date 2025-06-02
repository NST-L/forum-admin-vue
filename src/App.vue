<template>
  <div id="app">
    <TopNavbar v-if="route.path !== '/login'" />
    <div v-if="route.path === '/login'">
      <router-view />
    </div>
    <div v-else-if="store.state.loggedIn">
      <div class="main-layout">
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
}

.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 60px;
}

.app-container {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  box-sizing: border-box;
  border-left: 1px solid #ccc;
  height: 100vh;
  overflow-y: auto;
}

/* 响应式布局：当屏幕宽度小于等于768px时 */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    border-left: none;
  }
  .main-layout {
    margin-top: 0;
    height: 100vh;
  }
  .app-container {
    flex-direction: column;
    height: auto;
  }
}

html, body, #app {
  height: 100vh;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

</style>