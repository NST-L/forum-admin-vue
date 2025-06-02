import apiClient from './http';

// 获取用户违规举报列表
export const getUserViolationList = (params = {}) => {
  return apiClient.get('/api/violation/users', { params });
};

// 获取帖子违规举报列表
export const getPostViolationList = (params = {}) => {
  return apiClient.get('/api/violation/posts', { params });
};

// 获取评论违规举报列表
export const getCommentViolationList = (params = {}) => {
  return apiClient.get('/api/violation/comments', { params });
};

// 处理违规举报
export const handleViolation = (type, violationId, action, reason) => {
  // type: posts/users/comments, action: ban/reject
  return apiClient.post(`/api/violation/handle/${type}/${violationId}`, null, { params: { action, reason } });
}; 