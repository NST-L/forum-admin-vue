import apiClient from './http';

// 获取用户列表 - 对应后端 /forum/user/report 接口
export const getUserList = (params = {}) => {
  console.log('=== API getUserList 调用 ===');
  console.log('传入参数:', JSON.stringify(params, null, 2));
  
  // 确保参数格式正确，处理可能的null/undefined值
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });
  
  console.log('清理后参数:', JSON.stringify(cleanParams, null, 2));
  
  const request = apiClient.get('/forum/user/report', { params: cleanParams });
  console.log('发送请求到: /forum/user/report');
  
  // 添加响应处理
  return request.then(response => {
    console.log('=== API getUserList 响应 ===');
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return response;
  }).catch(error => {
    console.error('=== API getUserList 错误 ===');
    console.error('错误信息:', error.message);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应头:', error.response?.headers);
    console.error('错误响应数据:', error.response?.data);
    console.error('完整错误对象:', error);
    throw error;
  });
};

// 更新用户状态 - 对应后端 /forum/user/update-status 接口
export const updateUserStatus = (userId, status) => {
  console.log('更新用户状态:', { userId, status });
  
  // 验证必需参数
  if (!userId || status === null || status === undefined) {
    console.error('参数验证失败:', { userId, status });
    throw new Error('userId和status是必需参数');
  }
  
  // 确保参数类型正确
  const cleanUserId = String(userId).trim();
  const cleanStatus = parseInt(status);
  
  const formData = new FormData();
  formData.append('user_id', cleanUserId);
  formData.append('status', cleanStatus.toString());
  
  const request = apiClient.post('/forum/user/update-status', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return request.then(response => {
    console.log('用户状态更新成功:', response.data);
    return response;
  }).catch(error => {
    console.error('用户状态更新失败:', error.response?.data || error.message);
    throw error;
  });
};