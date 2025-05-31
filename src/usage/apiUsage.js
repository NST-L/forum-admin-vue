// src/usage/apiUsage.js
// 如何在Home.vue中使用API的示例

import { 
  getUserGrowthData, 
  getPostTrendData, 
  getViolationTypeData, 
  getMapHeatData,
  getHomeStats,
  getHomeDashboardData 
} from '@/api/home';

// 示例1：在Home.vue中获取用户增长数据
export const fetchUserGrowthExample = async () => {
  try {
    // 获取月度数据
    const monthResponse = await getUserGrowthData('month');
    if (monthResponse.data.success) {
      const monthData = monthResponse.data.data;
      // 更新图表
      userGrowthData.month = {
        xAxis: monthData.xAxis,
        data: monthData.data
      };
    }

    // 获取年度数据
    const yearResponse = await getUserGrowthData('year');
    if (yearResponse.data.success) {
      const yearData = yearResponse.data.data;
      userGrowthData.year = {
        xAxis: yearData.xAxis,
        data: yearData.data
      };
    }
  } catch (error) {
    console.error('获取用户增长数据失败:', error);
  }
};

// 示例2：在Home.vue中获取帖子趋势数据
export const fetchPostTrendExample = async () => {
  try {
    const response = await getPostTrendData(postTimeType.value);
    if (response.data.success) {
      const data = response.data.data;
      postGrowthData[postTimeType.value] = {
        xAxis: data.xAxis,
        data: data.series
      };
      updatePostChart();
    }
  } catch (error) {
    console.error('获取帖子趋势数据失败:', error);
  }
};

// 示例3：在Home.vue中获取举报类型数据
export const fetchViolationTypeExample = async () => {
  try {
    const response = await getViolationTypeData(selectedViolationType.value);
    if (response.data.success) {
      violationTypeData[selectedViolationType.value] = response.data.data;
      updateViolationChart();
    }
  } catch (error) {
    console.error('获取举报类型数据失败:', error);
  }
};

// 示例4：一次性获取所有首页数据（推荐方式）
export const initHomePageData = async () => {
  isLoading.value = true;
  try {
    const response = await getHomeDashboardData();
    if (response.data.success) {
      const { userGrowth, postTrend, violationType, stats } = response.data.data;
      
      // 更新用户增长数据
      userGrowthData.month = userGrowth.month;
      userGrowthData.year = userGrowth.year;
      
      // 更新帖子趋势数据
      postGrowthData.month = {
        xAxis: postTrend.month.xAxis,
        data: postTrend.month.series
      };
      postGrowthData.year = {
        xAxis: postTrend.year.xAxis,
        data: postTrend.year.series
      };
      
      // 更新举报类型数据
      violationTypeData.user = violationType.user;
      violationTypeData.post = violationType.post;
      violationTypeData.comment = violationType.comment;
      
      // 初始化图表
      initCharts();
    }
  } catch (error) {
    console.error('获取首页数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 示例5：完整的Home.vue集成代码片段
export const homeVueIntegration = `
// 在Home.vue的<script setup>中添加以下代码：

import { getUserGrowthData, getPostTrendData, getViolationTypeData, getHomeDashboardData } from '@/api/home';

// 获取用户增长数据
const fetchUserGrowth = async (type) => {
  try {
    const response = await getUserGrowthData(type);
    if (response.data.success) {
      userGrowthData[type] = response.data.data;
      if (type === userTimeType.value) {
        updateUserChart();
      }
    }
  } catch (error) {
    console.error('获取用户增长数据失败:', error);
  }
};

// 获取帖子趋势数据
const fetchPostTrend = async (type) => {
  try {
    const response = await getPostTrendData(type);
    if (response.data.success) {
      const data = response.data.data;
      postGrowthData[type] = {
        xAxis: data.xAxis,
        data: data.series
      };
      if (type === postTimeType.value) {
        updatePostChart();
      }
    }
  } catch (error) {
    console.error('获取帖子趋势数据失败:', error);
  }
};

// 获取举报类型数据
const fetchViolationType = async (type) => {
  try {
    const response = await getViolationTypeData(type);
    if (response.data.success) {
      violationTypeData[type] = response.data.data;
      if (type === selectedViolationType.value) {
        updateViolationChart();
      }
    }
  } catch (error) {
    console.error('获取举报类型数据失败:', error);
  }
};

// 初始化所有数据
const initAllData = async () => {
  isLoading.value = true;
  try {
    const response = await getHomeDashboardData();
    if (response.data.success) {
      const { userGrowth, postTrend, violationType } = response.data.data;
      
      // 更新所有数据
      userGrowthData.month = userGrowth.month;
      userGrowthData.year = userGrowth.year;
      
      postGrowthData.month = {
        xAxis: postTrend.month.xAxis,
        data: postTrend.month.series
      };
      postGrowthData.year = {
        xAxis: postTrend.year.xAxis,
        data: postTrend.year.series
      };
      
      violationTypeData.user = violationType.user;
      violationTypeData.post = violationType.post;
      violationTypeData.comment = violationType.comment;
      
      // 初始化图表
      initCharts();
    }
  } catch (error) {
    console.error('获取首页数据失败:', error);
    // 使用本地默认数据
    initCharts();
  } finally {
    isLoading.value = false;
  }
};

// 在onMounted中调用
onMounted(async () => {
  try {
    // 先初始化图表
    initCharts();
    
    // 获取API数据
    await initAllData();
    
    // 初始化地图
    await initMap();
  } catch (error) {
    console.error('初始化失败:', error);
  }
});

// 切换时间类型时重新获取数据
watch(userTimeType, (newType) => {
  fetchUserGrowth(newType);
});

watch(postTimeType, (newType) => {
  fetchPostTrend(newType);
});

watch(selectedViolationType, (newType) => {
  fetchViolationType(newType);
});
`; 