import apiClient from './http';
import { userViolationData, postViolationData, commentViolationData } from '@/data/violationData';

// 判断是否为开发环境
const isDevelopment = import.meta.env.DEV;

// 获取用户违规举报列表
export const getUserViolationList = (params = {}) => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: userViolationData
      }
    });
  }
  return apiClient.get('/api/violations/users', { params });
};

// 获取帖子违规举报列表
export const getPostViolationList = (params = {}) => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: postViolationData
      }
    });
  }
  return apiClient.get('/api/violations/posts', { params });
};

// 获取评论违规举报列表
export const getCommentViolationList = (params = {}) => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: commentViolationData
      }
    });
  }
  return apiClient.get('/api/violations/comments', { params });
};

// 处理违规举报
export const handleViolation = (type, violationId, action, reason) => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        message: `${type}违规举报${violationId}已${action}处理`
      }
    });
  }
  return apiClient.post(`/api/violations/${type}/${violationId}/handle`, { action, reason });
}; 