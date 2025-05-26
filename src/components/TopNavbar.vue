<template>
  <nav class="top-navbar">
    <div class="logo">
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADEElEQVR4nO2ZW4hOURTHf3MxM2YQIrekJkpoGEIRGZcXt5IiIQ9oxgPlQURyifJAmEa5pHgQKc/yQInIPJBbcp0HBlEYNTOuM1q1Tu1253x95/v2tLf6/rXq7H323mf/ztm3tQ4UVFBBPlQJrATOAM3AZ+AnsIr/RH2A/cBXoDvGngElBK4a4GUCgGlvgevAFqA3AUJ8yQLCtsfASAKaDy9ygIjsAdCLALQrD4jI6n1DlACtDkDu+QaZ4gAisqE+QdY5BKnzCVLvEGSNT5AVDkG87vqzHYIs8AlSBnxzANEFDMSzLjgAueIboi/w2gHIU6DcJ8hih3Nkmk+QeQ5BZHP16n+0O4DoBCrwrB0OQA4SiPblAbGdgDQ/D5DRBKRS4F0OEHcIUNtyAJFIS3AqA+6ngLgBFBGoJqUAGUbAGp8CZBABqyYFyCgC1BJ1ssamAKkG5oYEtBr4A+xOsQy/0om+B/gAjCMA7dTOiV8img68zwDRapx0L2neTB8d7w9sBI5YK5UEqCNVASdiII5qZDLScz0wlmuM7DLQAAzuSYBKfftt2qlfClVkDKfhRvkB1sm4TQEjjdD8m5quNcpKvcaeWNlq9O3Zb1gmuOi0pmW+mDprlD1p3VtrnXwlOm+3/xFY6gpiIdCRMN5lgouWa1o6bmpqBsfpnOYv0vSBhGf8BTbnC1GnY9huXD79JuOIsdX492EeO8YYdeQ6UrERM5YvEakhg6O2PleIIfpp4xqVN416dcc1nBPne5vDxezwLCO/S9uIPETzK5r2A5icC0i0NMbZRGPY2fcOGW1cNfLlOlJjTD3ZVNG2k557Ky3EBB2bmcI3VQmdkp8+0SpnDstOzSuO2WfOa50K4KHLYPfhLHbni1pW/jbdte7VJoSKZGLPsfLeAP0yfKluy06lAXmURYNiG7R8tfUnVzbLppjyTVb+b2CGtiGQ5lxLsidpQL5nCdKhe4xomdERWZFaYsq36NkqSu/VuuKbfMryme1pHLLbWTbarRulhE5Fx1L666U6Z66lqNccsmdZUEEEqn+Att4o0/bvGgAAAABJRU5ErkJggg==" alt="businessman">
      <span>云社 · Admin</span>
    </div>
    <span class="username" v-if="store.state.username">{{ `管理员：${store.state.username}` }}</span>
    <span v-else>未登录</span>
  </nav>
</template>

<script>
import { inject } from 'vue';
export default {
  name: 'TopNavbar',
  setup() {
    const store = inject('store');
    return { store };
  }
};
</script>

<style scoped>
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.username {
  color: #606060;
  font-weight: 500;
  margin-right: 20px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  margin-right: 10px;
}
</style> 