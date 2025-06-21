import apiClient from './http';

// 获取标签列表
export const getTagList = (params = {}) => {
  console.log('=== API getTagList 调用 ===');
  console.log('传入参数:', JSON.stringify(params, null, 2));
  
  const request = apiClient.get('/tags/list', { params });
  console.log('发送请求到: /tags/list');
  
  // 添加响应处理
  return request.then(response => {
    console.log('=== API getTagList 响应 ===');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return response;
  }).catch(error => {
    console.error('=== API getTagList 错误 ===');
    console.error('错误信息:', error.message);
    console.error('错误响应:', error.response?.data);
    throw error;
  });
};

// 新增标签
export const addTag = (data) => {
  return apiClient.post('/tags/add', {
    tag_name: data.tag_name
  });
};

// 更新标签
export const updateTag = (data) => {
  return apiClient.put('/tags/update', {
    tag_id: data.tag_id,
    tag_name: data.tag_name
  });
};

// 删除标签
export const deleteTag = (tagData) => {
  return apiClient.delete('/tags/delete', {
    data: {
      tag_id: tagData.tag_id,
      tag_name: tagData.tag_name
    }
  });
}; 