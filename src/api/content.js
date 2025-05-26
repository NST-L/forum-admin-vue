import apiClient from './http';

// 获取待审核内容列表
export const getContentList = () => apiClient.get('/api/contents');

// 审核内容
export const reviewContent = (contentId, status) => apiClient.patch(`/api/contents/${contentId}/review`, { status });

// 删除违规内容
export const deleteContent = (contentId) => apiClient.delete(`/api/contents/${contentId}`); 