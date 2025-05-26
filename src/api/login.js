// src/services/login.js
import apiClient from './http';

export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials)
    .then(response => {
      if (response.data && response.data.token) {
        // 新增用户名存储逻辑，假设接口返回username字段
        const username = credentials.username; // 根据实际接口返回字段调整
        store.login(response.data.token, username); // 调用修改后的store方法
      }
      return response;
    });
};