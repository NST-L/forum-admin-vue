// src/services/home.js
import apiClient from './http';

// 测试数据
const mockData = {
  userGrowth: {
    month: {
      xAxis: ['2023年1月', '2023年2月', '2023年3月', '2023年4月', '2023年5月'],
      data: [120, 200, 150, 80, 70]
    },
    year: {
      xAxis: ['2019', '2020', '2021', '2022', '2023'],
      data: [1200, 2500, 3200, 4800, 6500]
    }
  },
  postTrend: {
    month: {
      xAxis: ['2023年1月', '2023年2月', '2023年3月', '2023年4月', '2023年5月'],
      series: [
        [50, 80, 60, 100, 90],  // 技术
        [70, 100, 110, 130, 125], // 生活
        [30, 60, 45, 50, 55],   // 娱乐
        [150, 240, 215, 280, 270] // 总帖子数
      ]
    },
    year: {
      xAxis: ['2019', '2020', '2021', '2022', '2023'],
      series: [
        [300, 400, 500, 700, 900],  // 技术
        [350, 420, 600, 800, 950],  // 生活
        [200, 300, 350, 400, 420],  // 娱乐
        [850, 1120, 1450, 1900, 2270] // 总帖子数
      ]
    }
  },
  violationType: {
    user: [
      { value: 25, name: '违法' },
      { value: 35, name: '广告' },
      { value: 20, name: '攻击' },
      { value: 10, name: '涉政' },
      { value: 10, name: '其他' }
    ],
    post: [
      { value: 15, name: '违法' },
      { value: 40, name: '广告' },
      { value: 25, name: '攻击' },
      { value: 12, name: '涉政' },
      { value: 8, name: '其他' }
    ],
    comment: [
      { value: 18, name: '违法' },
      { value: 28, name: '广告' },
      { value: 30, name: '攻击' },
      { value: 14, name: '涉政' },
      { value: 10, name: '其他' }
    ]
  },
  mapHeat: {
    // 地图热力数据
    features: [
      { properties: { name: '北京', value: 1000 } },
      { properties: { name: '上海', value: 800 } },
      { properties: { name: '广州', value: 600 } },
      { properties: { name: '深圳', value: 500 } }
    ]
  }
};

// 判断是否为开发环境
const isDevelopment = import.meta.env.DEV;

// 获取首页数据
export const getHomeData = () => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: mockData
      }
    });
  }
  return apiClient.get('/api/home');
};

// 获取首页数据
export const getPageData = (pageNumber) => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          page: pageNumber,
          total: 100,
          items: Array(10).fill(null).map((_, index) => ({
            id: index + 1,
            title: `测试数据 ${index + 1}`,
            content: `测试内容 ${index + 1}`
          }))
        }
      }
    });
  }
  return apiClient.get(`/api/page/${pageNumber}`);
};

// 获取用户增长趋势数据
export const getUserGrowthData = (timeType = 'month') => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: mockData.userGrowth[timeType]
      }
    });
  }
  return apiClient.get('/api/home/user-growth', {
    params: { timeType }
  });
};

// 获取帖子数量趋势数据
export const getPostTrendData = (timeType = 'month') => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          xAxis: mockData.postTrend[timeType].xAxis,
          series: mockData.postTrend[timeType].series
        }
      }
    });
  }
  return apiClient.get('/api/home/post-trend', {
    params: { timeType }
  });
};

// 获取举报类型占比数据
export const getViolationTypeData = (targetType = 'user') => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: mockData.violationType[targetType]
      }
    });
  }
  return apiClient.get('/api/home/violation-type', {
    params: { targetType }
  });
};

// 获取地图热力数据
export const getMapHeatData = () => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: mockData.mapHeat
      }
    });
  }
  return apiClient.get('/api/home/map-heat');
};

// 获取首页综合统计数据
export const getHomeStats = () => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          totalUsers: 10000,
          totalPosts: 50000,
          totalComments: 200000,
          totalViolations: 1000
        }
      }
    });
  }
  return apiClient.get('/api/home/stats');
};

// 批量获取首页所有数据（提高加载效率）
export const getHomeDashboardData = () => {
  if (isDevelopment) {
    return Promise.resolve({
      data: {
        success: true,
        data: mockData
      }
    });
  }
  return apiClient.get('/api/home/dashboard');
};