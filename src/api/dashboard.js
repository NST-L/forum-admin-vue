import apiClient from './http';

// 获取统计数据
export const getDashboardStats = () => apiClient.get('/api/dashboard/stats');

// 获取在线设备数
export const getOnlineDevices = () => apiClient.get('/api/dashboard/online-devices'); 