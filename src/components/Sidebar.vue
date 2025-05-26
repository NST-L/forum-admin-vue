<template>
  <div class="sidebar">
    <ul class="sidebar-menu">
      <li>
        <router-link to="/" exact class="nav-link">
          <button class="animated-button">
            <span class="text">首页</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>
      <li>
        <router-link to="/user-management" class="nav-link">
          <button class="animated-button">
            <span class="text">用户管理</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>
      <li>
        <router-link to="/content-moderation" class="nav-link">
          <button class="animated-button">
            <span class="text">内容审核与违规处理</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>
      <li>
        <router-link to="/data-dashboard" class="nav-link">
          <button class="animated-button">
            <span class="text">后台数据管理</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>
      <li>
        <router-link to="/report-handling" class="nav-link">
          <button class="animated-button">
            <span class="text">举报处理机制</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>
    </ul>
    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </div>
</template>

<script>
import { inject } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Sidebar',
  setup() {
    const store = inject('store');
    const router = useRouter();
    const handleLogout = () => {
      store.logout();
      router.push('/login');
    };
    return { handleLogout };
  }
}
</script>

<style scoped>
.sidebar {
  width: 12%;
  background: #fff;
  color: #000000; /* 侧边栏黑色文字 */
  overflow: hidden;
  box-sizing: border-box;
  position: relative;

  /* 添加右侧竖线 */
  border-right: 1px solid #DAE0E6;

  /* 移动端适配：全宽 + 无圆角 */
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
    height: auto;
    min-height: auto;
    border-right: none; /* 移动端不显示竖线 */
  }
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(10, 10, 44, 0.39);
  text-align: center;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;

  /* 移动端适配：减少内边距 */
  @media (max-width: 768px) {
    padding: 10px;
  }
}

.animated-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 26px;
  border-color: transparent;
  font-size: 16px;
  background-color: inherit;
  border-radius: 15px;
  font-weight: 500;
  color: #686868; /* 未激活状态文字 */
  box-shadow: 0 0 0 2px #666666; /* 按钮边框 */
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  width: 100%;
}

.animated-button svg {
  position: absolute;
  width: 24px;
  fill: #666666; /* 按钮箭头 */
  z-index: 9;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .arr-1 {
  right: 10px;
  @media (max-width: 768px) {
    right: 5px;
  }
}

.animated-button .arr-2 {
  left: -20%;
  @media (max-width: 768px) {
    left: -25%;
  }
}

.animated-button .circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: #DAE0E6; /* 预览填充色 */
  border-radius: 50%;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .text {
  position: relative;
  z-index: 1;
  transform: translateX(-12px);
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button:hover {
  box-shadow: 0 0 0 12px transparent;
  color: #000000; /* 悬停状态文字 */
}

.animated-button:hover .arr-1 {
  right: -25%;
}

.animated-button:hover .arr-2 {
  left: 16px;
}

.animated-button:hover .text {
  transform: translateX(12px);
}

.animated-button:hover svg {
  fill: #000000; /* 悬停指示箭头 */
}

.animated-button:active {
  /* 添加位移效果 */
  transform: translateX(25px) scale(1.2);
  
  /* 优化阴影反馈 */
  box-shadow: 
    0 0 0 4px #ffffff, 
    0 0 10px rgba(0, 0, 0, 0.2);
  
  /* 添加过渡动画 */
  transition: all 0.1s ease-in-out;
}

.animated-button:hover .circle {
  width: 320px;
  height: 320px;
  opacity: 1;
}

.router-link-exact-active .animated-button {
  background-color:#DAE0E6;
  box-shadow: 0 0 0 4px #ffffff; /* 当前路由指示边框 */
  color: #000000; /* 当前路由文字 */
}

.router-link-exact-active .animated-button svg {
  fill: #1A1A1B; /* 当前路由指示箭头 */
}

.router-link-exact-active .animated-button .circle {
  background-color: #DAE0E6; /* 当前路由动态指示器 */
}

/* 去除router-link下划线 */
.nav-link, .nav-link:visited, .nav-link.router-link-exact-active, .nav-link.router-link-active {
  text-decoration: none !important;
}
</style>