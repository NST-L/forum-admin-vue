<template>
  <div class="login-container">
    <div class="form_main">
      <!-- 标题 -->
      <h2 class="heading">管理员登录</h2>

      <!-- 用户名输入框 -->
      <div class="inputContainer">
        <svg class="inputIcon" viewBox="0 0 16 16" fill="currentColor" height="16" width="16">
          <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
        </svg>
        <input 
          type="text" 
          v-model="username" 
          class="inputField" 
          placeholder="用户名" 
          autocomplete="off" 
          required 
        />
      </div>

      <!-- 密码输入框 -->
      <div class="inputContainer">
        <svg class="inputIcon" viewBox="0 0 16 16" fill="currentColor" height="16" width="16">
          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
        </svg>
        <input 
          type="password" 
          v-model="password" 
          class="inputField" 
          placeholder="密码" 
          required 
        />
      </div>

      <!-- 登录按钮 -->
      <button type="submit" @click="handleLogin" class="button">登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { inject } from 'vue';

const store = inject('store');
const router = useRouter();

const username = ref('');
const password = ref('');

const handleLogin = () => {
  const validUsers = [
    { username: 'a', password: 'a' },
    { username: '1', password: '1' }
  ];
  
  const isValidUser = validUsers.some(user => 
    user.username === username.value && 
    user.password === password.value
  );
  
  if (isValidUser) {
    const token = 'mock-token-123';
    store.login(token, username.value);
    router.push('/');
  } else {
    alert('用户名或密码错误');
  }
};
</script>

<style scoped>
/* 动画：橙色背景从左侧滑入 */
@keyframes slideInBackground {
  0% {
    transform: translateX(-100%) rotate(45deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) rotate(45deg);
    opacity: 1;
  }
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form_main {
  width: 500px;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #EDEFF1;
  padding: 30px;
  box-shadow: 15px 15px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border-radius: 15px;
}

.form_main::before {
  position: absolute;
  content: "";
  width: 600px;
  height: 600px;
  background-color: #FF4500;
  transform: rotate(45deg);
  left: -453px;
  bottom: -30px;
  z-index: 1;
  border-radius: 30px;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.082);

  /* 动画关键 */
  animation: slideInBackground 1s ease-out forwards;
}

.heading {
  font-size: 2em;
  color: #2e2e2e;
  font-weight: 700;
  margin: 5px 0 10px 0;
  z-index: 2;
}

.inputContainer {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.inputIcon {
  position: absolute;
  left: 10%;
}

.inputField {
  width: 80%;
  height: 30px;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid #686868;
  margin: 15px 0;
  color: black;
  font-size: 0.8em;
  font-weight: 500;
  box-sizing: border-box;
  padding-left: 30px;
}

.inputField:focus {
  outline: none;
  border-bottom: 2px solid rgb(236, 144, 63);
}

.inputField::placeholder {
  color: rgb(0, 0, 0);
  font-size: 0.6em;
  font-weight: 500;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  cursor: pointer;
  width: 50%;
  height: 50px;
  background-image: linear-gradient( #D8D9DB 0%, #fff 80%, #FDFDFD 100%);
  border-radius: 30px;
  border: 1px solid #8F9092;
  transition: all 0.2s ease;
  font-family: "Source Sans Pro", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #606060;
  text-shadow: 0 1px #fff;
}

.button:hover {
  box-shadow: 0 4px 3px 1px #FCFCFC, 0 6px 8px #D6D7D9, 0 -4px 4px #CECFD1, 0 -6px 4px #FEFEFE, inset 0 0 3px 3px #CECFD1;
}

.button:active {
  box-shadow: 0 4px 3px 1px #FCFCFC, 0 6px 8px #D6D7D9, 0 -4px 4px #CECFD1, 0 -6px 4px #FEFEFE, inset 0 0 5px 3px #999, inset 0 0 30px #aaa;
}

.button:focus {
  box-shadow: 0 4px 3px 1px #FCFCFC, 0 6px 8px #D6D7D9, 0 -4px 4px #CECFD1, 0 -6px 4px #FEFEFE, inset 0 0 5px 3px #999, inset 0 0 30px #aaa;
}
</style>
