// src/services/http.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

// 根据后端配置，使用8080端口
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 支持Cookie认证
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 后端使用Cookie认证，不需要在请求头中设置Authorization
    // Cookie会自动在请求中携带
    console.log(`[HTTP] 请求: ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    
    // 检查Cookie是否存在（检查Authorization Cookie）
    const hasCookie = document.cookie.includes('Authorization=');
    console.log(`[HTTP] Cookie状态: ${hasCookie ? '存在' : '不存在'}`);
    if (hasCookie) {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('Authorization='));
      const tokenPreview = authCookie ? authCookie.split('=')[1].substring(0, 20) + '...' : 'N/A';
      console.log(`[HTTP] Cookie预览: ${tokenPreview}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器（统一错误处理）
apiClient.interceptors.response.use(
  (response) => {
    // 统一处理成功响应
    console.log(`[HTTP] 响应: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('[HTTP] 响应错误:', error);
    if (error.response) {
      console.error('[HTTP] 错误状态码:', error.response.status);
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，清除用户信息并跳转到登录页
          console.log('[HTTP] 401错误，清除登录状态');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('isLoggedIn');
          
          // 避免在登录页面重复跳转
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login');
            ElMessage.error('登录已过期，请重新登录');
          }
          break;
        case 403:
          ElMessage.error('没有权限访问该资源');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error(error.response.data?.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('[HTTP] 网络错误:', error.request);
      ElMessage.error('网络错误，请检查网络连接');
    } else {
      // 请求配置出错
      console.error('[HTTP] 配置错误:', error.message);
      ElMessage.error('请求配置错误: ' + error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;