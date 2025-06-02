<template>
  <div class="input sidebar-custom">
    <router-link to="/" exact class="value">
      <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      首页
    </router-link>
    <router-link to="/user-management" class="value">
      <svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 8 1.34 8 4v4H4v-4c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
      用户管理
    </router-link>
    <router-link to="/category-management" class="value">
      <svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
      分类管理
    </router-link>
    <router-link to="/report-handling" class="value">
      <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 8h14v-2H7v2zm0-4h14v-2H7v2zm0-6v2h14V7H7z"/></svg>
      帖子违规处理
    </router-link>
    <router-link to="/comment-violation" class="value">
      <svg viewBox="0 0 24 24"><path d="M21 6h-2v9H5v2c0 1.1.9 2 2 2h9l4 4V8c0-1.1-.9-2-2-2z"/></svg>
      评论违规处理
    </router-link>
    <router-link to="/user-violation" class="value">
      <svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 8 1.34 8 4v4H4v-4c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
      用户违规处理
    </router-link>
  </div>
</template>

<script setup>
// 保留空，原Sidebar逻辑不再需要
</script>

<style scoped>
.input {
  display: flex;
  flex-direction: column;
  width: 200px;
  background-color: #ffffff;
  justify-content: center;
  padding: 24px 0;
  gap: 8px;
  padding-bottom: 100%;
}

.value {
  background-color: transparent;
  border: none;
  padding: 10px 18px;
  color: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  position: relative;
  gap: 10px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
  text-decoration: none;
  transition: background 0.2s, color 0.2s, filter 0.2s, transform 0.2s;
}

.value:not(:active):hover,
.value:focus {
  background-color: #00000010;
}






.value svg {
  width: 18px;
  height: 18px;
  fill: #000000;
}

.input:hover > :not(.value:hover) {
  transition: 300ms;
  filter: blur(1px);
  transform: scale(0.95,0.95);
}

.sidebar-custom {
  min-width: 8%;
  max-width: 18.75rem;
  box-shadow: none !important;
  box-sizing: border-box;
  border: 1.5px solid rgba(0, 0, 0, 0.4);
  border-top: none;
  border-bottom: none;
  position: relative;
  height: 100%;
  min-height: 0;
  align-self: stretch;
  z-index: 1000;
}


@media (max-width: 1024px) {
  .input {
    width: 22vw;
  }
}
@media (max-width: 768px) {
  .input {
    width: 100vw;
    min-width: 0;
    max-width: 100vw;
    position: fixed;
    left: 0; top: 0; z-index: 2000;
    height: 100vh;
    border-radius: 0;
  }
}
</style>