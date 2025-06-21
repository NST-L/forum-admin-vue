<template>
  <nav class="top-navbar">
    <div class="navbar-content">
              <div class="navbar-left">
          <div class="logo-container">
            <img src="@/assets/logo.png" alt="云社" class="logo-icon" />
          </div>
          <h1 class="navbar-title">云社 · Admin</h1>
        </div>
      <div class="navbar-right">
        <div class="user-section">
          <div class="user-info">
            <span class="username">{{ username }}</span>
          </div>
          <div class="user-actions">
            <button class="logout-btn" @click="logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z"/>
              </svg>
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { inject, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'TopNavbar',
  setup() {
    const store = inject('store');
    const router = useRouter();

    const username = computed(() => {
      return store.state.user?.username || store.state.username || '管理员';
    });

    const logout = () => {
      store.logout();
      router.push('/login');
    };

    return {
      username,
      logout
    };
  }
};
</script>

<style scoped>
.top-navbar {
  height: 60px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  height: 100%;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.logo-container {
  width: 36px;
  height: 36px;
  background: #FF4500;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 69, 0, 0.2);
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
}

.logo-icon {
  width: 55px;
  height: 55px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.navbar-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--foreground-color);
  letter-spacing: -0.5px;
}

.navbar-right {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 69, 0, 0.08);
  border-radius: var(--border-radius-sm);
  border: 1px solid rgba(255, 69, 0, 0.2);
}

.username {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
}

.user-actions {
  display: flex;
  align-items: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  color: var(--foreground-muted);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.logout-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 var(--spacing-md);
  }
  
  .navbar-title {
    font-size: 18px;
  }
  
  .user-section {
    gap: var(--spacing-sm);
  }
  

  
  .logout-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 13px;
  }
  
  .logout-btn span {
    display: none;
  }
}

@media (max-width: 480px) {
  .user-info {
    padding: var(--spacing-xs);
  }
  
  .username {
    font-size: 13px;
  }
  
  .logout-btn {
    padding: var(--spacing-xs);
  }
}
</style>
