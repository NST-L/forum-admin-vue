// src/data/usageExample.js
// 如何在Home.vue中使用测试数据的示例

// 示例1：直接使用测试数据（开发阶段）
import { userGrowthData, postTrendData, violationTypeData } from '@/data';

export const useTestDataDirectly = () => {
  // 在Home.vue的<script setup>中
  const userGrowthData = ref({
    month: userGrowthData.month,
    year: userGrowthData.year
  });

  const postGrowthData = ref({
    month: {
      xAxis: postTrendData.month.xAxis,
      data: postTrendData.month.data
    },
    year: {
      xAxis: postTrendData.year.xAxis,
      data: postTrendData.year.data
    }
  });

  const violationTypeData = ref(violationTypeData);
};

// 示例2：模拟API调用（使用测试数据）
export const mockApiCalls = () => {
  // 模拟获取用户增长数据
  const getUserGrowthData = (timeType) => {
    return Promise.resolve({
      data: {
        success: true,
        data: userGrowthData[timeType]
      }
    });
  };

  // 模拟获取帖子趋势数据
  const getPostTrendData = (timeType) => {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          xAxis: postTrendData[timeType].xAxis,
          series: postTrendData[timeType].data
        }
      }
    });
  };

  // 模拟获取举报类型数据
  const getViolationTypeData = (targetType) => {
    return Promise.resolve({
      data: {
        success: true,
        data: violationTypeData[targetType]
      }
    });
  };

  return {
    getUserGrowthData,
    getPostTrendData,
    getViolationTypeData
  };
};

// 示例3：在开发环境使用测试数据，生产环境使用真实API
export const hybridDataUsage = `
// 在Home.vue中
import { getUserGrowthData, getPostTrendData, getViolationTypeData } from '@/api/home';
import { userGrowthData as testUserData, postTrendData as testPostData } from '@/data';

const isDevelopment = import.meta.env.DEV;

// 获取用户增长数据
const fetchUserGrowth = async (type) => {
  try {
    if (isDevelopment) {
      // 开发环境使用测试数据
      userGrowthData[type] = testUserData[type];
      updateUserChart();
    } else {
      // 生产环境使用API
      const response = await getUserGrowthData(type);
      if (response.data.success) {
        userGrowthData[type] = response.data.data;
        updateUserChart();
      }
    }
  } catch (error) {
    console.error('获取用户增长数据失败:', error);
    // 失败时使用测试数据作为后备
    userGrowthData[type] = testUserData[type];
    updateUserChart();
  }
};
`;

// 示例4：完整的测试数据集成方案
export const completeIntegration = `
// 在Home.vue中完整集成测试数据

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
// 导入测试数据
import { 
  userGrowthData as testUserData, 
  postTrendData as testPostData,
  violationTypeData as testViolationData,
  homeStatsData as testStatsData
} from '@/data';
// 导入API（可选）
import { getUserGrowthData, getPostTrendData, getViolationTypeData } from '@/api/home';

// 是否使用测试数据
const useTestData = true; // 或者从环境变量读取

// 数据响应式引用
const userGrowthData = ref(useTestData ? testUserData : {});
const postGrowthData = ref(useTestData ? {
  month: { xAxis: testPostData.month.xAxis, data: testPostData.month.data },
  year: { xAxis: testPostData.year.xAxis, data: testPostData.year.data }
} : {});
const violationTypeData = ref(useTestData ? testViolationData : {});

// 初始化函数
const initData = async () => {
  if (useTestData) {
    // 直接使用测试数据，无需API调用
    console.log('使用测试数据');
    initCharts();
  } else {
    // 从API获取数据
    try {
      await fetchAllData();
    } catch (error) {
      console.error('API调用失败，使用测试数据', error);
      // 失败时回退到测试数据
      userGrowthData.value = testUserData;
      postGrowthData.value = {
        month: { xAxis: testPostData.month.xAxis, data: testPostData.month.data },
        year: { xAxis: testPostData.year.xAxis, data: testPostData.year.data }
      };
      violationTypeData.value = testViolationData;
      initCharts();
    }
  }
};

onMounted(() => {
  initData();
});
</script>
`; 