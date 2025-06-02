import apiClient from './http';

// 获取用户列表
export const getUserList = (params = {}) => {
  return apiClient.get('/api/users', { params });
};

// 更新用户状态
export const updateUserStatus = (userId, status, reason) => {
  return apiClient.put(`/api/users/${userId}/status`, { status, reason });
};

// 获取用户详情
export const getUserDetail = (userId) => {
  return apiClient.get(`/api/users/${userId}`);
};

// 导出用户活动记录
export const exportUserActivity = (userId) => {
  return apiClient.get(`/api/users/${userId}/export`);
};

// 新增用户
export const addUser = (userData) => {
  return apiClient.post('/api/users', userData);
};

// 修改用户信息
export const updateUser = (userId, userData) => {
  return apiClient.put(`/api/users/${userId}`, userData);
};

// 删除用户
export const deleteUser = (userId) => {
  return apiClient.delete(`/api/users/${userId}`);
}; 