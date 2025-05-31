// src/data/homeData.js
// 首页综合测试数据

// 导入各个模块的数据
import { userGrowthData } from './userGrowthData';
import { postTrendData } from './postTrendData';
import { violationTypeData } from './violationTypeData';
import { mapHeatData } from './mapHeatData';
import { homeStatsData } from './homeStatsData';

// 首页综合数据（一次性获取所有数据）
export const homeDashboardData = {
  userGrowth: userGrowthData,
  postTrend: postTrendData,
  violationType: violationTypeData,
  mapHeat: mapHeatData,
  stats: homeStatsData
};

// 导出所有数据模块
export { userGrowthData, postTrendData, violationTypeData, mapHeatData, homeStatsData }; 