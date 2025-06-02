import { reactive, readonly } from 'vue';

const storeData = reactive({
  token: localStorage.getItem('token') || '',
  username: localStorage.getItem('username') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
});

export default {
  get state() {
    return readonly({
      loggedIn: !!storeData.token,
      token: storeData.token,
      username: storeData.username,
      userInfo: storeData.userInfo
    });
  },
  login(token, username, userInfo = {}) {
    storeData.token = token;
    storeData.username = username;
    storeData.userInfo = userInfo;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  },
  logout() {
    storeData.token = '';
    storeData.username = '';
    storeData.userInfo = {};
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
  }
};