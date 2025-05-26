import { reactive, readonly } from 'vue';

const storeData = reactive({
  token: localStorage.getItem('token') || '',
});

export default {
  get state() {
    return readonly({
      loggedIn: !!storeData.token,
      token: storeData.token
    });
  },
  login(token) {
    storeData.token = token;
    localStorage.setItem('token', token);
  },
  logout() {
    storeData.token = '';
    localStorage.removeItem('token');
  }
}; 