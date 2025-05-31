<template>
  <div class="sidebar">
    <ul class="sidebar-menu">
      <li>
        <router-link to="/" exact class="nav-link">
          <button class="animated-button">
            <span class="text">首页</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
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
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>

      <li>
        <router-link to="/report-handling" class="nav-link">
          <button class="animated-button">
            <span class="text">帖子违规处理</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>

      <li>
        <router-link to="/comment-violation" class="nav-link">
          <button class="animated-button">
            <span class="text">评论违规处理</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>

      <li>
        <router-link to="/user-violation" class="nav-link">
          <button class="animated-button">
            <span class="text">用户违规处理</span>
            <svg class="arr-1" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <svg class="arr-2" viewBox="0 0 24 24">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"/>
            </svg>
            <span class="circle"></span>
          </button>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
// ... existing code ...
</script>

<style scoped>
.sidebar {
  min-width: 11.25rem;
  width: 15vw;
  max-width: 18.75rem;
  background: #fff;
  color: #000000;
  box-sizing: border-box;
  position: relative;
  border-right: 1px solid #DAE0E6;
  transition: width 0.3s ease;
  will-change: width;
  transform: translateZ(0);
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.collapsed {
  /* 设置收起后侧边栏宽度 */
  width: 2%;
}

.toggle-btn {
  position: absolute;
  top: 0.9375rem;
  right: -1.25rem;
  width: 2.5rem;
  height: 2.5rem;
  background-color: #fff;
  border: 0.1875rem solid #DAE0E6;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  stroke: #000000;
}

.sidebar-menu {
  list-style: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 50px 20px 20px;
}

.animated-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0.375rem 1.625rem;
  font-size: 1rem;
  min-height: 2.75rem;
  background-color: inherit;
  border-radius: 15px;
  font-weight: 500;
  color: #686868;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  width: 100%;
  border: none;
}

.animated-button svg {
  position: absolute;
  width: 24px;
  fill: #666666;
  z-index: 9;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .arr-1 { right: 10px; }
.animated-button .arr-2 { left: -20%; }
.animated-button .circle {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 100%; height: 100%;
  background-color: #DAE0E6;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}
.animated-button .text {
  position: relative;
  z-index: 1;
  transform: translateX(-12px);
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}
.animated-button:hover { color: #000; box-shadow: 0 0 0 12px transparent; }
.animated-button:hover .arr-1 { right: -25%; }
.animated-button:hover .arr-2 { left: 16px; }
.animated-button:hover .text { transform: translateX(12px); }
.animated-button:hover svg { fill: #000; }
.animated-button:hover .circle { opacity: 1; }
.animated-button:active {
  transform: translateX(25px) scale(1.2);
  box-shadow: 0 0 0 4px #fff, 0 0 10px rgba(0, 0, 0, 2);
  transition: all 0.1s ease-in-out;
}

.router-link-exact-active .animated-button {
  background-color: #DAE0E6;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.7);
  color: #000;
}
.router-link-exact-active .animated-button svg { fill: #1A1A1B; }
.router-link-exact-active .animated-button .circle { background-color: #DAE0E6; }

.nav-link { text-decoration: none !important; }

@media (max-width: 1024px) {
  .sidebar { width: 22vw; }
}
@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
    min-width: 0;
    max-width: 100vw;
    position: fixed;
    left: 0; top: 0; z-index: 2000;
    height: 100vh;
    border-radius: 0;
    border-right: none;
  }
  .sidebar.collapsed { width: 100%; }
  .sidebar-menu { padding: 10px; }
  .animated-button .arr-1 { right: 5px; }
  .animated-button .arr-2 { left: -25%; }
}
</style>