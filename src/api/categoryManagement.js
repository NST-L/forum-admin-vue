import apiClient from './http';

// 获取分类列表
export const getCategoryList = (params = {}) => {
  console.log('=== API getCategoryList 调用 ===');
  console.log('传入参数:', JSON.stringify(params, null, 2));
  
  const request = apiClient.get('/categories/list', { params });
  console.log('发送请求到: /categories/list');
  
  // 添加响应处理
  return request.then(response => {
    console.log('=== API getCategoryList 响应 ===');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return response;
  }).catch(error => {
    console.error('=== API getCategoryList 错误 ===');
    console.error('错误信息:', error.message);
    console.error('错误响应:', error.response?.data);
    throw error;
  });
};

// 新增分类
export const addCategory = (data) => {
  const requestData = {
    category_name: data.category_name
  };
  console.log('发送新增分类请求数据:', requestData);
  return apiClient.post('/categories/add', requestData);
};

// 更新分类
export const updateCategory = (data) => {
  return apiClient.put('/categories/update', {
    category_id: data.category_id,
    category_name: data.category_name
  });
};

// 删除分类
export const deleteCategory = (category_id) => {
  return apiClient.get(`/categories/delete?category_id=${category_id}`);
};