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
  height: 100vh; /* 高度占满视口高度 */
  display: flex; /* 使用弹性盒模型，方便布局 */
  flex-direction: column; /* 主轴方向为垂直，列方向 */
  min-height: 100vh; /* 最小高度也设为视口高度，保证全屏显示 */
}

.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 60px;
  height: calc(100vh - 65px);
  min-height: 0;
}

.app-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
  height: 100%;
}

.main-content {
  flex: 1;
  box-sizing: border-box;
  border-left: 1px solid #ccc;
  min-height: 0;
  height: 100%;
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

</style>