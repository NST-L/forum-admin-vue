<template>
  <nav class="top-navbar">
    <div class="logo">
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADEElEQVR4nO2ZW4hOURTHf3MxM2YQIrekJkpoGEIRGZcXt5IiIQ9oxgPlQURyifJAmEa5pHgQKc/yQInIPJBbcp0HBlEYNTOuM1q1Tu1253x95/v2tLf6/rXq7H323mf/ztm3tQ4UVFBBPlQJrADOAM3AZ+AnsIr/RH2A/cBXoDvGngElBK4a4GUCgGlvgevAFqA3AUJ8yQLCtsfASAKaDy9ygIjsAdCLALQrD4jI6n1DlACtDkDu+QaZ4gAisqE+QdY5BKnzCVLvEGSNT5AVDkG87vqzHYIs8AlSBnxzANEFDMSzLjgAueIboi/w2gHIU6DcJ8hih3Nkmk+QeQ5BZHP16n+0O4DoBCrwrB0OQA4SiPblAbGdgDQ/D5DRBKRS4F0OEHcIUNtyAJFIS3AqA+6ngLgBFBGoJqUAGUbAGp8CZBABqyYFyCgC1BJ1ssamAKkG5oYEtBr4A+xOsQy/0om+B/gAjCMA7dTOiV8img68zwDRapx0L2neTB8d7w9sBI5YK5UEqCNVASdiII5qZDLScz0wlmuM7DLQAAzuSYBKfftt2qlfClVkDKfhRvkB1sm4TQEjjdD8m5quNcpKvcaeWNlq9O3Zb1gmuOi0pmW+mDprlD1p3VtrnXwlOm+3/xFY6gpiIdCRMJ5lgouWa1o6bmpqBsfpnOYv0vSBhGf8BTbnC1GnY9huXD79JuOIsdX492EeO8YYdeQ6UrERM5YvEakhg6O2PleIIfpp4xqVN406dcc1nBPne5vDxezwLCO/S9uIPETzK5r2A5icC0i0NMbZRGPY2fcOGW1cNfLlOlJjTD3ZVNG2k557Ky3EBB2bmcI3VQmdkp8+0SpnDstOzSuO2WfOa50K4KHLYPfhLHbni1pW/jbdte7VJoSKZGLPsfLeAP0yfKluy06lAXmURYNiG7R8tfUnVzbLppjyTVb+b2CGtiGQ5lxLsidpQL5nCdKhe4xomdERWZFaYsq36NkqSu/VuuKbfMryme1pHLLbWTbarRulhE5Fx1L666U6Z66lqNccsmdZUEEEqn+Att4o0/bvGgAAAABJRU5ErkJggg==" alt="businessman">
      <span>云社 · Admin</span>
    </div>
    <button class="Btn" v-if="store.state.username" @click="toggleModal">
    <svg class="svgIcon" viewBox="0 0 576 512">
        <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z"></path>
      </svg>
      管理员：{{ store.state.username }}
    </button>
    <span v-else>未登录</span>
    <!-- 卡片式弹窗 -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="toggleModal">
      <div class="card">
        <ul class="list">
          <li class="element" @click="toggleModal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
              <path d="m15 5 4 4"/>
            </svg>
            <p class="label">修改资料</p>
          </li>
        </ul>
        <div class="separator"></div>
        <ul class="list">
          <li class="element delete" @click="handleLogout">
            <svg viewBox="0 0 24 24">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="m15 5 4 4"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            <p class="label">退出登录</p>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'TopNavbar',
  setup() {
    const store = inject('store');
    const router = useRouter();
    const isModalVisible = ref(false);
    
    const toggleModal = () => {
      isModalVisible.value = !isModalVisible.value;
    };
    
    const handleLogout = () => {
      store.logout();
      router.push('/login');
    };

    return { 
      store, 
      isModalVisible,
      toggleModal,
      handleLogout
    };
  }
};
</script>

<style scoped>
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: #fff;
  box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  margin-right: 0.625rem;
  width: 2.25rem;
  height: 2.25rem;
}

/* 新增按钮样式 */
.Btn {
  min-width: 8.125rem;
  height: 2.75rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  margin-right: 3rem;
  border: none;
  box-shadow: 2px 2px 4px #00000081;
  color: #111;
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-weight: 500;
  transition: box-shadow 0.2s, transform 0.1s;
}

.Btn:active {
  box-shadow: 0 1px 0 #888, 0 0 0 2px #fff inset;
  transform: translateY(1px);
}

.Btn:hover {
  box-shadow: 2px 2px 4px #000000;
}

.svgIcon {
  width: 20px;
}

.svgIcon path {
  fill: rgb(0, 0, 0); /* 设置图标颜色，使其在按钮中保持对比度 */
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  z-index: 1001;
}

/* 新增卡片样式 */
.card {
  background-color: #DAE0E6;
  border-radius: 10px;
  padding: 10px 0;
  width: 200px;
  margin-top: 60px;
  margin-right: 20px;
}

.separator {
  border-top: 1.5px solid #3d3d3d;
  margin: 10px 20px;
}

.list {
  list-style-type: none;
  padding: 0 10px;
  margin: 0;
}

.element {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease-out;
  color: #7e8590;
}

.element svg {
  width: 20px;
  height: 19px;
  stroke: currentColor;
  stroke-width: 1;
}

.element:hover {
  background-color: #0079D3b0;
  color: #000000;
  transform: translate(1px, -1px);
}

.element.delete:hover {
  background-color: #ff0000b0;
}

.element:active {
  transform: scale(0.99);
}

.label {
  font-weight: 500;
  margin: 0;
}

@media (max-width: 768px) {
  .top-navbar {
    flex-direction: column;
    align-items: stretch;
    padding: 0.5rem 0.5rem;
  }
  .logo {
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  .Btn {
    width: 100%;
    margin: 0.5rem 0 0 0;
    font-size: 1.125rem;
    min-height: 3rem;
  }
}
</style>
