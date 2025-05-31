import apiClient from './http';
import { userManagementData } from '@/data/userManagementData';

// 判断是否为开发环境
const isDevelopment = import.meta.env.DEV;

// 获取用户列表
export const getUserList = (params = {}) => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          users: userManagementData.users,
          total: userManagementData.users.length
        }
      }
    });
  }
  return apiClient.get('/api/users', { params });
};

// 更新用户状态
export const updateUserStatus = (userId, status, reason) => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        message: `用户${userId}状态已更新为${status}`
      }
    });
  }
  return apiClient.put(`/api/users/${userId}/status`, { status, reason });
};

// 获取用户详情
export const getUserDetail = (userId) => {
  if (isDevelopment) {
    const user = userManagementData.users.find(u => u.id === userId);
    return Promise.resolve({
      data: {
        success: true,
        data: user
      }
    });
  }
  return apiClient.get(`/api/users/${userId}`);
};

// 导出用户活动记录
export const exportUserActivity = (userId) => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        message: `用户${userId}的活动记录导出成功`
      }
    });
  }
  return apiClient.get(`/api/users/${userId}/export`);
}; 