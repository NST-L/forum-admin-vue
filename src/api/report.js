import apiClient from './http';

// 获取举报列表
export const getReportList = () => apiClient.get('/api/reports');

// 处理举报
export const handleReport = (reportId, action) => apiClient.post(`/api/reports/${reportId}/handle`, { action }); 