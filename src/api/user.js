import apiClient from './http';

// 获取用户列表
export const getUserList = () => apiClient.get('/api/users');

// 新增用户
export const addUser = (userData) => apiClient.post('/api/users', userData);

// 修改用户
export const updateUser = (userId, userData) => apiClient.put(`/api/users/${userId}`, userData);

// 删除用户
export const deleteUser = (userId) => apiClient.delete(`/api/users/${userId}`); 