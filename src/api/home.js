// src/services/home.js
import apiClient from './http';

export const getHomeData = () => {
  return apiClient.get('/api/home');
};

export const getPageData = (pageNumber) => {
  return apiClient.get(`/api/page/${pageNumber}`);
};

// 新增首页统计数据接口
export const getHomeStats = () => apiClient.get('/api/home/stats');