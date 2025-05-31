// src/data/index.js
// 统一导出所有测试数据

export * from './homeData';
export * from './userGrowthData';
export * from './postTrendData';
export * from './violationTypeData';
export * from './homeStatsData';
export * from './mapHeatData';
export * from './userManagementData';
export * from './violationData';

// 导出一个包含所有数据的对象
export const allTestData = {
  userGrowthData: require('./userGrowthData').userGrowthData,
  postTrendData: require('./postTrendData').postTrendData,  
  violationTypeData: require('./violationTypeData').violationTypeData,
  mapHeatData: require('./mapHeatData').mapHeatData,
  homeStatsData: require('./homeStatsData').homeStatsData,
  homeDashboardData: require('./homeData').homeDashboardData
}; 