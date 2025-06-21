<template>
  <div class="login-page">
    <!-- 左上角品牌标识 -->
    <div class="brand-header">
      <div class="brand-logo">
        <span class="brand-chinese">云社</span>
        <span class="brand-dot">·</span>
        <span class="brand-english">OpenShare</span>
      </div>
      <div class="brand-slogan">
        连接世界，分享智慧 —— 打造下一代智能社交平台
      </div>
    </div>
    
    <!-- 顶部SVG装饰 -->
    <div class="svg-top">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="1337" width="1337">
        <defs>
          <path id="path-1" opacity="1" fill-rule="evenodd" d="M1337,668.5 C1337,1037.455193874239 1037.455193874239,1337 668.5,1337 C523.6725684305388,1337 337,1236 370.50000000000006,1094 C434.03835568300906,824.6732385973953 6.906089672974592e-14,892.6277623047779 0,668.5000000000001 C0,299.5448061257611 299.5448061257609,1.1368683772161603e-13 668.4999999999999,0 C1037.455193874239,0 1337,299.544806125761 1337,668.5Z"/>
          <linearGradient id="linearGradient-2" x1="0.79" y1="0.62" x2="0.21" y2="0.86">
            <stop offset="0" stop-color="rgb(255,69,0)" stop-opacity="1"/>
            <stop offset="1" stop-color="rgb(204,34,0)" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <g opacity="1">
          <use xlink:href="#path-1" fill="url(#linearGradient-2)" fill-opacity="1"/>
        </g>
      </svg>
    </div>

    <!-- 底部SVG装饰 -->
    <div class="svg-bottom">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="896" width="967.8852157128662">
        <defs>
          <path id="path-2" opacity="1" fill-rule="evenodd" d="M896,448 C1142.6325445712241,465.5747656464056 695.2579309733121,896 448,896 C200.74206902668806,896 5.684341886080802e-14,695.2579309733121 0,448.0000000000001 C0,200.74206902668806 200.74206902668791,5.684341886080802e-14 447.99999999999994,0 C695.2579309733121,0 475,418 896,448Z"/>
          <linearGradient id="linearGradient-3" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0" stop-color="rgb(255,69,0)" stop-opacity="1"/>
            <stop offset="1" stop-color="rgb(153,26,0)" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <g opacity="1">
          <use xlink:href="#path-2" fill="url(#linearGradient-3)" fill-opacity="1"/>
        </g>
      </svg>
    </div>

    <!-- 主容器 -->
    <section class="container">
      <section class="wrapper">
        <header>
          <div class="logo">
            <img src="@/assets/logo.png" alt="Open Share Logo" />
          </div>
          <h1>Admin Login</h1>
        </header>
        
        <section class="main-content">
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <input 
                type="text" 
                v-model="phoneOrEmail" 
                placeholder="Phone/Email" 
                autocomplete="off" 
                required 
                :disabled="loading"
              />
              <div class="line"></div>
            </div>
            
            <div class="input-group password-container">
              <input 
                type="password" 
                v-model="password" 
                placeholder="Password" 
                required 
                autocomplete="current-password"
                :disabled="loading"
                @keyup.enter="handleLogin"
                @keyup="checkCapsLock"
                @keydown="checkCapsLock"
              />
              <div class="line"></div>
              <div v-if="capsLockOn" class="caps-lock-warning">
                大写锁定已开启
              </div>
            </div>
            
            <button 
              type="submit" 
              :disabled="loading || !phoneOrEmail || !password"
              :class="{ loading: loading }"
            >
              {{ loading ? '登录中...' : 'Login' }}
            </button>
          </form>
        </section>

      </section>
    </section>

    <!-- 错误弹窗 -->
    <div v-if="showError" class="login-error-modal-mask">
      <div class="login-error-modal">
        <div class="login-error-title">登录提示</div>
        <div class="login-error-msg">{{ errorMessage }}</div>
        <button class="login-error-btn" @click="showError = false">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { inject } from 'vue';
import { login } from '@/api/login';

const store = inject('store');
const router = useRouter();

const phoneOrEmail = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const showError = ref(false);
const capsLockOn = ref(false);

const handleLogin = async () => {
  if (!phoneOrEmail.value?.trim() || !password.value?.trim()) {
    errorMessage.value = '请输入手机号/邮箱和密码';
    showError.value = true;
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  showError.value = false;

  try {
    const response = await login(phoneOrEmail.value, password.value);
    
    if (response.data.code === 0) {
      phoneOrEmail.value = '';
      password.value = '';
      store.login(response.data);
      setTimeout(() => {
        router.push('/');
      }, 100);
    } else {
      errorMessage.value = response.data.message || '登录失败，请稍后重试';
      showError.value = true;
      phoneOrEmail.value = '';
      password.value = '';
    }
  } catch (error) {
    errorMessage.value = error.message || '登录失败，请稍后重试';
    showError.value = true;
    phoneOrEmail.value = '';
    password.value = '';
  } finally {
    loading.value = false;
  }
};

const checkCapsLock = (event) => {
  if (event && typeof event.getModifierState === 'function') {
    capsLockOn.value = event.getModifierState('CapsLock');
  } else {
    capsLockOn.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700&display=swap');

.login-page {
  margin: 0;
  height: 100vh;
  overflow: hidden;
  background-color: #DAE0E6;
  font-family: 'Roboto', sans-serif;
  position: relative;
}

.brand-header {
  position: absolute;
  top: 5%;
  left: 5%;
  z-index: 10;
  max-width: 500px;
}

.brand-logo {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.brand-chinese {
  font-size: 36px;
  font-weight: 700;
  color: #FF4500;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.brand-dot {
  font-size: 36px;
  font-weight: 700;
  color: #2C3E50;
  margin: 0 4px;
}

.brand-english {
  font-size: 36px;
  font-weight: 700;
  color: #2C3E50;
  font-family: 'Roboto', sans-serif;
}

.brand-slogan {
  font-size: 16px;
  color: #666;
  font-weight: 400;
  line-height: 1.4;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.svg-top {
  position: absolute;
  top: -82%;
  right: -40%;
  z-index: 0;
  opacity: 0.8;
}

.svg-bottom {
  position: absolute;
  bottom: -50%;
  left: -200px;
  z-index: 0;
  opacity: 0.8;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  z-index: 1;
}

.wrapper {
  padding: 45px 40px;
  background-color: #fff;
  border-radius: 20px;
  width: 380px;
  min-height: 450px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
}

header {
  margin-bottom: 40px;
  flex-shrink: 0;
}

.logo {
  width: 70px;
  height: 70px;
  border-radius: 50px;
  background-color: #FF4500;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
}

.logo img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

h1 {
  color: #FF4500;
  font-size: 40px;
  font-weight: 500;
  margin-bottom: 8px;
  margin-top: 0;
  line-height: 1.2;
}

header p {
  color: #999;
  font-size: 16px;
  font-weight: 300;
  margin: 0;
  opacity: 0.8;
}

.input-group {
  margin-bottom: 28px;
  position: relative;
  width: 100%;
  max-width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.login-form {
  width: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.main-content input {
  border: none;
  outline: none;
  box-shadow: none;
  display: block;
  width: 100%;
  max-width: 100%;
  height: 48px;
  margin: 0;
  padding: 12px 0 6px 0;
  font-size: 16px;
  color: #374151;
  background: #ffffff;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
  line-height: 1.5;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.main-content input::placeholder {
  color: #9ca3af;
  font-size: 15px;
  font-weight: 400;
}

.main-content input:focus {
  outline: none;
  border: none;
  box-shadow: none;
  color: #FF4500;
}

.main-content input:focus::placeholder {
  color: rgba(156, 163, 175, 0.5);
}

.main-content input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-container {
  position: relative;
}

.line {
  width: 100%;
  height: 1px;
  background-color: #d1d5db;
  margin-top: 0;
  transition: all 0.3s ease;
}

.input-group:focus-within .line {
  background-color: #FF4500;
  height: 2px;
}

button {
  background: linear-gradient(to right, #FF4500, #FF6B35);
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  height: 48px;
  margin: 35px 0 0 0;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;
  letter-spacing: 0.2px;
  box-sizing: border-box;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 69, 0, 0.3);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: linear-gradient(to right, #9ca3af, #d1d5db);
}

button.loading {
  background: linear-gradient(to right, #999, #ccc);
}





/* 大小写锁定警告样式 */
.caps-lock-warning {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  text-align: center;
  z-index: 10;
  margin-top: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 错误弹窗样式 */
.login-error-modal-mask {
  position: fixed;
  left: 0; 
  top: 0; 
  right: 0; 
  bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-error-modal {
  background: #fff;
  border-radius: 10px;
  min-width: 320px;
  max-width: 90vw;
  padding: 28px 32px 18px 32px;
  position: relative;
  text-align: center;
}

.login-error-title {
  font-size: 18px;
  font-weight: bold;
  color: #e03131;
  margin-bottom: 10px;
}

.login-error-msg {
  color: #444;
  font-size: 15px;
  margin-bottom: 18px;
}

.login-error-btn {
  background: #FF4500;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 20px auto 0 auto;
  width: auto;
  height: auto;
  display: block;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 69, 0, 0.2);
}

.login-error-btn:hover {
  background: #E63E00;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .brand-header {
    top: 20px;
    left: 20px;
    max-width: calc(100% - 40px);
  }
  
  .brand-chinese,
  .brand-dot,
  .brand-english {
    font-size: 24px;
  }
  
  .brand-slogan {
    font-size: 14px;
  }
  
  .wrapper {
    width: 90%;
    min-width: 320px;
    max-width: 400px;
    padding: 35px 25px;
    min-height: 400px;
    box-sizing: border-box;
  }
  
  .input-group {
    margin-bottom: 24px;
  }
  
  .logo {
    width: 70px;
    height: 70px;
    margin-bottom: 25px;
    background-color: #FF4500;
  }
  
  .logo img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }
  
  h1 {
    font-size: 32px;
  }
  
  header p {
    font-size: 15px;
  }
  
  .main-content input {
    font-size: 15px;
    height: 44px;
    padding: 10px 0 5px 0;
  }
  
  .main-content input::placeholder {
    font-size: 15px;
  }
  
  button {
    height: 44px;
    font-size: 15px;
    margin: 28px 0 0 0;
  }
  
  .svg-top {
    top: -300px;
    right: -200px;
    transform: scale(0.7);
    opacity: 0.7;
  }
  
  .svg-bottom {
    bottom: -150px;
    left: -150px;
    transform: scale(0.6);
    opacity: 0.7;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .brand-header {
    top: 30px;
    left: 30px;
    max-width: calc(100% - 60px);
  }
  
  .brand-chinese,
  .brand-dot,
  .brand-english {
    font-size: 30px;
  }
  
  .brand-slogan {
    font-size: 15px;
  }
  
  .wrapper {
    width: 400px;
    max-width: 90vw;
    box-sizing: border-box;
  }
  
  .svg-top {
    top: -350px;
    right: -250px;
    opacity: 0.75;
  }
  
  .svg-bottom {
    bottom: -180px;
    left: -180px;
    opacity: 0.75;
  }
}
</style>
