// src/api/home.js
import apiClient from './http';
import { REPORT_REASON_TEXT_MAP } from './violation';

// 获取首页数据 - 使用模拟数据
export const getHomeData = () => {
  console.log('[Home] 获取首页数据 - 使用模拟数据');
  return Promise.resolve({
    data: {
      success: true,
      data: { message: '首页数据获取成功' }
    }
  });
};

// 获取用户增长趋势数据 - 连接真实后端API
export const getUserGrowthData = (time_type = 'month') => {
  console.log('[Home] 获取用户增长数据 - 连接后端API, 时间类型:', time_type);
  console.log('[Home] 用户API完整路径:', '/forum/user/user-trend');
  console.log('[Home] 用户请求参数:', { time_type });
  
  return apiClient.get('/forum/user/user-trend', { 
    params: { time_type } 
  }).then(res => {
    console.log('[Home] 后端返回的用户增长数据 - 完整响应:', res);
    console.log('[Home] 后端返回的用户增长数据 - res.data:', res.data);
    console.log('[Home] 后端返回的用户增长数据 - res.data.data:', res.data?.data);
    
    // 检查响应结构
    if (!res.data) {
      console.warn('[Home] 响应数据为空');
      return { data: { xAxis: [], data: [] } };
    }
    
    if (res.data.code !== 0) {
      console.warn('[Home] API返回错误代码:', res.data.code);
      return { data: { xAxis: [], data: [] } };
    }
    
    // 转换后端数据格式以适配前端图表
    // 后端返回: [{time: "2024-01", count: 120}, ...]
    // 前端需要: {xAxis: ["2024-01", ...], data: [120, ...]}
    const backendData = res.data?.data || [];
    console.log('[Home] 解析的用户数据数组:', backendData);
    console.log('[Home] 用户数据数组长度:', backendData.length);
    
    if (!Array.isArray(backendData)) {
      console.error('[Home] 用户数据不是数组格式:', typeof backendData, backendData);
      return { data: { xAxis: [], data: [] } };
    }
    
    const chartData = {
      xAxis: backendData.map(item => {
        console.log('[Home] 处理用户数据项:', item, '时间:', item.time);
        return item.time;
      }),
      data: backendData.map(item => {
        console.log('[Home] 处理用户数据项:', item, '数量:', item.count);
        return item.count;
      })
    };
    
    console.log('[Home] 转换后的用户图表数据:', chartData);
    console.log('[Home] 用户图表 xAxis:', chartData.xAxis);
    console.log('[Home] 用户图表 data:', chartData.data);
    
    return {
      data: chartData
    };
  }).catch(error => {
    console.error('[Home] 获取用户增长数据失败:', error);
    console.error('[Home] 错误详情:', error.response);
    console.error('[Home] 错误状态码:', error.response?.status);
    console.error('[Home] 错误响应数据:', error.response?.data);
    // 如果API失败，返回空数据而不是错误
    return {
      data: {
        xAxis: [],
        data: []
      }
    };
  });
};

// 获取帖子数量趋势数据 - 连接真实后端API
export const getPostTrendData = (time_type = 'month') => {
  console.log('[Home] 获取帖子发布趋势数据 - 连接后端API, 时间类型:', time_type);
  console.log('[Home] 帖子API完整路径:', '/posts/post-trend');
  console.log('[Home] 帖子请求参数:', { time_type });
  
  return apiClient.get('/posts/post-trend', { 
    params: { time_type } 
  }).then(res => {
    console.log('[Home] 后端返回的帖子趋势数据:', res.data);
    
    // 后端返回格式: {total: [{time, count}], categories: [{category_name, count, time}]}
    const backendData = res.data?.data || {};
    const totalData = backendData.total || [];
    const categoriesArray = backendData.categories || [];
    
    console.log('[Home] 解析帖子数据 - totalData:', totalData);
    console.log('[Home] 解析帖子数据 - categoriesArray:', categoriesArray);
    
    // 构建图表数据
    const chartData = {
      xAxis: totalData.map(item => item.time),
      categories: [],
      series: []
    };
    
    // 处理分类数据 - 按时间分组
    const categoryMap = new Map();
    categoriesArray.forEach(item => {
      const categoryName = item.category_name;
      const time = item.time;
      const count = item.count;
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, new Map());
      }
      categoryMap.get(categoryName).set(time, count);
    });
    
    console.log('[Home] 分类数据映射:', categoryMap);
    
    // 获取所有分类名称
    chartData.categories = Array.from(categoryMap.keys());
    
    // 为每个分类构建数据序列
    chartData.categories.forEach(categoryName => {
      const categoryTimeMap = categoryMap.get(categoryName);
      const categoryData = chartData.xAxis.map(time => {
        return categoryTimeMap.get(time) || 0; // 如果某个时间点没有数据，默认为0
      });
      chartData.series.push(categoryData);
    });
    
    // 添加总数据
    chartData.series.push(totalData.map(item => item.count));
    
    console.log('[Home] 转换后的帖子图表数据:', chartData);
    return {
      data: chartData
    };
  }).catch(error => {
    console.error('[Home] 获取帖子趋势数据失败:', error);
    console.error('[Home] 帖子错误详情:', error.response);
    console.error('[Home] 帖子错误状态码:', error.response?.status);
    console.error('[Home] 帖子错误响应数据:', error.response?.data);
    // 如果API失败，返回空数据
    return {
      data: {
        xAxis: [],
        categories: [],
        series: []
      }
    };
  });
};

// 获取举报类型占比数据 - 连接真实后端API
export const getViolationTypeData = (report_type = 'user') => {
  console.log('[Home] 获取举报类型占比数据 - 连接后端API, 举报类型:', report_type);
  console.log('[Home] 举报类型API完整路径:', '/report/reason/statistics');
  console.log('[Home] 举报类型请求参数:', { report_type });
  
  return apiClient.get('/report/reason/statistics', { 
    params: { report_type } 
  }).then(res => {
    console.log('[Home] 后端返回的举报类型统计数据 - 完整响应:', res);
    console.log('[Home] 后端返回的举报类型统计数据 - res.data:', res.data);
    console.log('[Home] 后端返回的举报类型统计数据 - res.data.data:', res.data?.data);
    
    // 检查响应结构
    if (!res.data) {
      console.warn('[Home] 举报类型响应数据为空');
      return { data: [] };
    }
    
    if (res.data.code !== 0) {
      console.warn('[Home] 举报类型API返回错误代码:', res.data.code);
      return { data: [] };
    }
    
    // 转换后端数据格式以适配前端图表
    // 后端返回: [{name: "POST_ILLEGAL", value: 45}, ...]
    // 前端需要: [{name: "违法内容", value: 45}, ...]
    const backendData = res.data?.data || [];
    console.log('[Home] 解析的举报类型数据数组:', backendData);
    console.log('[Home] 举报类型数据数组长度:', backendData.length);
    
    if (!Array.isArray(backendData)) {
      console.error('[Home] 举报类型数据不是数组格式:', typeof backendData, backendData);
      return { data: [] };
    }
    
    // 将英文名称映射为中文名称
    const chartData = backendData.map(item => {
      console.log('[Home] 处理举报类型数据项:', item, '原始名称:', item.name, '数量:', item.value);
      
      // 尝试从映射表中获取中文名称，如果没有找到则使用原名称
      const chineseName = REPORT_REASON_TEXT_MAP[item.name] || item.name;
      console.log('[Home] 映射结果:', item.name, '->', chineseName);
      
      return {
        name: chineseName,
        value: item.value
      };
    });
    
    // 数据去重：如果有重复的中文名称，合并其数值
    const mergedData = {};
    chartData.forEach(item => {
      if (mergedData[item.name]) {
        mergedData[item.name] += item.value;
        console.log('[Home] 合并重复项:', item.name, '新值:', mergedData[item.name]);
      } else {
        mergedData[item.name] = item.value;
      }
    });
    
    // 转换为数组格式
    const finalChartData = Object.keys(mergedData).map(name => ({
      name: name,
      value: mergedData[name]
    }));
    
    console.log('[Home] 去重后的举报类型图表数据:', finalChartData);
    
    return {
      data: finalChartData
    };
  }).catch(error => {
    console.error('[Home] 获取举报类型统计数据失败:', error);
    console.error('[Home] 举报类型错误详情:', error.response);
    console.error('[Home] 举报类型错误状态码:', error.response?.status);
    console.error('[Home] 举报类型错误响应数据:', error.response?.data);
    // 如果API失败，返回空数据而不是错误
    return {
      data: []
    };
  });
};

// 获取首页综合统计数据 - 使用模拟数据
export const getHomeStats = () => {
  console.log('[Home] 获取统计数据 - 使用模拟数据');
  return Promise.resolve({
    data: {
      success: true,
      data: {
        totalUsers: 1250,
        totalPosts: 3400,
        totalComments: 8900,
        totalReports: 145
      }
    }
  });
};

// 测试函数 - 使用您提供的真实数据格式进行测试
export const testUserGrowthData = (time_type = 'month') => {
  const mockData = time_type === 'year' 
    ? {
        code: 0,
        data: [
          { count: 10, time: "2023" },
          { count: 9, time: "2024" },
          { count: 1, time: "2025" }
        ],
        success: true
      }
    : {
        code: 0,
        data: [
          { count: 10, time: "2023-02" },
          { count: 9, time: "2024-01" },
          { count: 1, time: "2025-06" }
        ],
        success: true
      };
  
  console.log('[Test] 使用测试用户数据:', mockData);
  
  // 使用相同的处理逻辑
  const backendData = mockData.data || [];
  const chartData = {
    xAxis: backendData.map(item => item.time),
    data: backendData.map(item => item.count)
  };
  
  console.log('[Test] 测试用户图表数据:', chartData);
  return Promise.resolve({
    data: chartData
  });
};

export const testPostTrendData = (time_type = 'month') => {
  const mockData = time_type === 'year'
    ? {
        code: 0,
        data: {
          total: [
            { count: 4, time: "2023" },
            { count: 4, time: "2024" },
            { count: 160, time: "2025" }
          ],
          categories: [
            { category_name: "创业经验", count: 2, time: "2025" },
            { category_name: "宠物生活", count: 3, time: "2025" },
            { category_name: "文化艺术", count: 35, time: "2025" },
            { category_name: "母婴育儿", count: 12, time: "2025" },
            { category_name: "汽车交通", count: 4, time: "2025" }
          ]
        },
        success: true
      }
    : {
        code: 0,
        data: {
          total: [
            { count: 4, time: "2023-04" },
            { count: 4, time: "2024-01" },
            { count: 160, time: "2025-06" }
          ],
          categories: [
            { category_name: "创业经验", count: 2, time: "2025-06" },
            { category_name: "宠物生活", count: 3, time: "2025-06" },
            { category_name: "文化艺术", count: 35, time: "2025-06" },
            { category_name: "母婴育儿", count: 12, time: "2025-06" },
            { category_name: "汽车交通", count: 4, time: "2025-06" }
          ]
        },
        success: true
      };
  
  console.log('[Test] 使用测试帖子数据:', mockData);
  return Promise.resolve(mockData);
};

// 测试函数 - 举报类型数据
export const testViolationTypeData = (report_type = 'user') => {
  const mockData = {
    user: {
      code: 0,
      data: [
        { name: "USER_IMPERSONATE", value: 25 },
        { name: "USER_HARASSMENT", value: 18 },
        { name: "USER_SEXY_PROFILE", value: 15 },
        { name: "USER_FRAUD", value: 12 },
        { name: "USER_POLITICAL", value: 8 }
      ],
      success: true
    },
    post: {
      code: 0,
      data: [
        { name: "POST_ILLEGAL", value: 35 },
        { name: "POST_AD", value: 28 },
        { name: "POST_PORN", value: 20 },
        { name: "POST_PROVOKE", value: 15 },
        { name: "POST_FRAUD", value: 10 }
      ],
      success: true
    },
    comment: {
      code: 0,
      data: [
        { name: "COMMENT_ATTACK", value: 40 },
        { name: "COMMENT_SPAM", value: 22 },
        { name: "COMMENT_PROVOKE", value: 18 },
        { name: "COMMENT_OFF_TOPIC", value: 12 },
        { name: "COMMENT_PRIVACY", value: 8 }
      ],
      success: true
    }
  };
  
  const testData = mockData[report_type] || mockData.user;
  console.log('[Test] 使用测试举报类型数据:', testData);
  
  // 使用相同的处理逻辑，将英文名称映射为中文
  const backendData = testData.data || [];
  const chartData = backendData.map(item => {
    const chineseName = REPORT_REASON_TEXT_MAP[item.name] || item.name;
    console.log('[Test] 映射结果:', item.name, '->', chineseName);
    return {
      name: chineseName,
      value: item.value
    };
  });
  
  console.log('[Test] 测试举报类型图表数据:', chartData);
  return Promise.resolve({
    data: chartData
  });
};

// 获取所有帖子位置点云数据
export const getPostLocations = () =>
  apiClient.get('/posts/list', { params: { fetch_all: true } })
    .then(res => {
      const list = res.data?.data?.list || [];
      // console.log('📍 原始API响应数据:', res.data);
      // console.log('📍 获取到帖子数据:', list.length, '条');
      
      // 统计有无位置信息的帖子
      const withLocation = list.filter(item => !!item.location);
      const withoutLocation = list.filter(item => !item.location);
      
      // console.log('📊 数据统计:');
      // console.log('  - 有位置信息:', withLocation.length, '条');
      // console.log('  - 无位置信息:', withoutLocation.length, '条');
      
      if (withoutLocation.length > 0) {
        // console.log('⚠️ 无位置信息的帖子示例:', withoutLocation.slice(0, 3));
      }
      
      const locations = withLocation.map((item, index) => {
        // console.log(`🔍 处理第${index + 1}个帖子:`, item.post_id, '位置:', item.location);
        
        const [lng, lat] = item.location.split(',').map(Number);
        
        if (isNaN(lng) || isNaN(lat)) {
          // console.error('❌ 坐标解析失败:', item.post_id, item.location);
          return null;
        }
        
        // console.log(`✅ 解析坐标:`, item.post_id, `经度:${lng}, 纬度:${lat}`);
        
        return {
          lng,
          lat,
          post_id: item.post_id,
          title: item.title
        };
      }).filter(item => item !== null);
      
      // console.log('🎯 最终有效位置数据:', locations.length, '个点');
      // console.log('📊 前5个位置数据样本:', locations.slice(0, 5));
      return locations;
    });