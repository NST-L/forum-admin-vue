import apiClient from './http';

/**
 * 设置认证Cookie
 * @param {string} token JWT令牌
 * @param {number} expiresIn 过期时间（秒）
 */
function setAuthCookie(token, expiresIn = 604800) { // 默认7天
  if (typeof document === 'undefined') {
    return; // 服务端渲染时跳过
  }
  
  // 计算过期日期
  const expireDate = new Date();
  expireDate.setTime(expireDate.getTime() + (expiresIn * 1000));
  
  // 设置Cookie（与后端HttpConstant.COOKIE_AUTH_FIELD保持一致）
  document.cookie = `Authorization=${token}; expires=${expireDate.toUTCString()}; path=/; SameSite=Lax`;
  console.log('[Auth] Cookie已设置:', `Authorization=${token.substring(0, 20)}...`);
}

/**
 * 清除认证Cookie
 */
function clearAuthCookie() {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  console.log('[Auth] Cookie已清除');
}

// 管理员登录 - 适配后端接口（蛇形命名）
export const login = async (phone_or_email, password) => {
  console.log('[Login API] 开始管理员登录请求');
  const response = await apiClient.post('/user/admin-login', { 
    phone_or_email: phone_or_email, // 后端使用蛇形命名策略
    password: password 
  });
  
  // 如果登录成功，设置Cookie
  if (response.data.success === true && response.data.data?.accessToken) {
    const { accessToken, expiresIn = 604800 } = response.data.data;
    setAuthCookie(accessToken, expiresIn);
    console.log('[Login API] 登录成功，Cookie已设置');
  }
  
  return response;
};

// 用户登出
export const logout = async () => {
  // 后端基于Cookie认证，这里只需要清除前端状态和Cookie
  clearAuthCookie();
  console.log('[Login API] 已登出，Cookie已清除');
  return Promise.resolve();
};

// 获取用户信息
export const getUserInfo = async (user_id) => {
  return apiClient.get('/user/info', {
    params: { user_id: user_id }
  });
};