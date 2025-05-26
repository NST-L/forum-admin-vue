import { reactive, readonly } from 'vue';

const storeData = reactive({
  token: localStorage.getItem('token') || '',
  username: localStorage.getItem('username') || '' // 新增用户名存储字段
});

export default {
  get state() {
    return readonly({
      loggedIn: !!storeData.token,
      token: storeData.token,
      username: storeData.username // 暴露用户名到状态
    });
  },
  login(token, username) { // 修改登录方法接收用户名
    storeData.token = token;
    storeData.username = username;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username); // 持久化存储用户名
  },
  logout() {
    storeData.token = '';
    storeData.username = ''; // 清除用户名
    localStorage.removeItem('token');
    localStorage.removeItem('username'); // 移除存储的用户名
  }
};