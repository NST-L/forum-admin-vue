import apiClient from './http';

// 获取分类列表
export const getCategoryList = (params = {}) => {
  return apiClient.get('/categories/list', { params });
};

// 新增分类
export const addCategory = (data) => {
  return apiClient.post('/categories/add', data);
};

// 更新分类
export const updateCategory = (data) => {
  return apiClient.put('/categories/update', data);
};

// 删除分类
export const deleteCategory = (data) => {
  return apiClient.delete('/categories/delete', { data });
}; 