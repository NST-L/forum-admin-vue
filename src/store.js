import { reactive, readonly } from 'vue';

const storeData = reactive({
  userId: localStorage.getItem('userId') || '',
  username: localStorage.getItem('username') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
});

export default {
  get state() {
    return readonly({
      loggedIn: storeData.isLoggedIn,
      userId: storeData.userId,
      username: storeData.username,
      userInfo: storeData.userInfo,
      // 后端使用Cookie认证，token只用于前端状态判断
      token: storeData.isLoggedIn ? 'cookie-auth' : ''
    });
  },
  login(loginResponse) {
    // 适配后端LoginVO结构
    const userInfo = loginResponse.data;
    storeData.userId = userInfo.userId;
    storeData.username = userInfo.username;
    storeData.userInfo = userInfo;
    storeData.isLoggedIn = true;
    
    // 存储到localStorage
    localStorage.setItem('userId', userInfo.userId);
    localStorage.setItem('username', userInfo.username);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('[Store] 登录成功，用户信息已保存:', userInfo);
  },
  logout() {
    storeData.userId = '';
    storeData.username = '';
    storeData.userInfo = {};
    storeData.isLoggedIn = false;
    
    // 清除localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isLoggedIn');
    
    console.log('[Store] 已登出，清除用户信息');
  }
};