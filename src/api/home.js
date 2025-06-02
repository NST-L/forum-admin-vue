// src/api/home.js
import apiClient from './http';

// 获取首页数据
export const getHomeData = () => apiClient.get('/api/home');

// 获取用户增长趋势数据
export const getUserGrowthData = (timeType = 'month') =>
  apiClient.get('/api/home/user-growth', { params: { timeType } });

// 获取帖子数量趋势数据
export const getPostTrendData = (timeType = 'month') =>
  apiClient.get('/api/home/post-trend', { params: { timeType } });

// 获取举报类型占比数据
export const getViolationTypeData = (targetType = 'user') =>
  apiClient.get('/api/home/violation-type', { params: { targetType } });

// 获取首页综合统计数据
export const getHomeStats = () => apiClient.get('/api/home/stats');

// 批量获取首页所有数据（提高加载效率）
export const getHomeDashboardData = () => apiClient.get('/api/home/dashboard');

// 获取帖子位置数据
export const getPostLocations = () => apiClient.get('/api/post/locations');

// 获取帖子位置CSV数据（用于Loca渲染）
export const getPostLocationsCSV = () => apiClient.get('/api/post/locations/csv');