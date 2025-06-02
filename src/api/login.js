import apiClient from './http';

// 用户登录
export const login = async (username, password) => {
  return apiClient.post('/api/auth/login', { username, password });
};

// 用户登出
export const logout = async () => {
  return apiClient.post('/api/auth/logout');
};

// 验证token有效性
export const verifyToken = async (token) => {
  return apiClient.post('/api/auth/verify', { token });
};

// 刷新token
export const refreshToken = async (token) => {
  return apiClient.post('/api/auth/refresh', { token });
};

// 获取用户信息
export const getUserInfo = async () => {
  return apiClient.get('/api/auth/user');
}; 