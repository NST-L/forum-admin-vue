// src/usage/homeVueExample.js
// 完整的Home.vue示例代码，展示如何集成所有功能

export const completeHomeVueExample = `
<template>
  <div class="page-content">
    <div class="charts-wrapper">
      <!-- 用户增长趋势图表 -->
      <div class="chart">
        <div class="chart-title">
          <span>用户增长趋势</span>
          <div class="time-switch">
            <button 
              :class="{ active: userTimeType === 'month' }" 
              @click="switchUserTimeType('month')"
            >月度</button>
            <button 
              :class="{ active: userTimeType === 'year' }" 
              @click="switchUserTimeType('year')"
            >年度</button>
          </div>
        </div>
        <div ref="userChartRef" class="chart-content" />
      </div>

      <!-- 帖子趋势图表 -->
      <div class="chart">
        <div class="chart-title">
          <span>各类帖子数量趋势</span>
          <div class="time-switch">
            <button 
              :class="{ active: postTimeType === 'month' }" 
              @click="switchPostTimeType('month')"
            >月度</button>
            <button 
              :class="{ active: postTimeType === 'year' }" 
              @click="switchPostTimeType('year')"
            >年度</button>
          </div>
        </div>
        <div ref="postChartRef" class="chart-content" />
      </div>

      <!-- 举报类型占比图表 -->
      <div class="chart">
        <div class="chart-title">
          <span>举报类型占比</span>
          <div class="violation-type-switch">
            <button
              v-for="option in violationTypeOptions"
              :key="option.value"
              :class="{ active: selectedViolationType === option.value }"
              @click="selectedViolationType = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div ref="violationChartRef" class="chart-content" />
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container-wrapper">
      <div id="mapContainer" class="map-container" />
      <!-- 左上角信息窗口 -->
      <div v-if="infoContentVisible" class="map-info-window-fixed">
        <InfoWindowContent
          v-bind="infoContentData"
          @drill-down="(adcode, e) => window.go2Adcode(e, adcode)"
        />
      </div>
      <!-- 左下角上浮按钮 -->
      <div class="map-up-btn-fixed">
        <input id="up-btn" type="button" class="button" value="行政区上浮" />
      </div>
    </div>

    <!-- 加载状态遮罩 -->
    <div v-if="isLoading" class="loading-mask">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import InfoWindowContent from '@/components/InfoWindowContent.vue';

// API导入（生产环境）
import { getUserGrowthData, getPostTrendData, getViolationTypeData, getHomeDashboardData } from '@/api/home';

// 测试数据导入（开发环境）
import { 
  userGrowthData as testUserData, 
  postTrendData as testPostData,
  violationTypeData as testViolationData 
} from '@/data';

// 判断是否为开发环境
const isDevelopment = import.meta.env.DEV;

// 图表引用
const userChartRef = ref(null);
const postChartRef = ref(null);
const violationChartRef = ref(null);

// 地图相关变量
let map = null;
let vLayer = null;
let infoWin = null;
let vLayerClickHandler = null;
let vLayerMousemoveHandler = null;
let upBtnHandler = null;

// 数据相关
const userTimeType = ref('month');
const postTimeType = ref('month');
const selectedViolationType = ref('user');
const isLoading = ref(true);

// 选项配置
const violationTypeOptions = [
  { label: '用户', value: 'user' },
  { label: '帖子', value: 'post' },
  { label: '评论', value: 'comment' }
];

// 数据存储
const userGrowthData = ref(isDevelopment ? testUserData : {});
const postGrowthData = ref(isDevelopment ? {
  month: { xAxis: testPostData.month.xAxis, data: testPostData.month.data },
  year: { xAxis: testPostData.year.xAxis, data: testPostData.year.data }
} : {});
const violationTypeData = ref(isDevelopment ? testViolationData : {});

// 信息窗口数据
const infoContentData = ref({
  name: '',
  value: '',
  childrenNum: 0,
  adcode: ''
});
const infoContentVisible = ref(false);

// 图表实例存储
let charts = {
  user: null,
  post: null,
  violation: null
};

// 获取数据的函数
const fetchUserGrowth = async (type) => {
  if (isDevelopment) {
    // 开发环境直接使用测试数据
    updateUserChart();
    return;
  }
  
  try {
    const response = await getUserGrowthData(type);
    if (response.data.success) {
      userGrowthData.value[type] = response.data.data;
      if (type === userTimeType.value) {
        updateUserChart();
      }
    }
  } catch (error) {
    console.error('获取用户增长数据失败:', error);
    // 失败时使用测试数据
    userGrowthData.value[type] = testUserData[type];
    updateUserChart();
  }
};

const fetchPostTrend = async (type) => {
  if (isDevelopment) {
    updatePostChart();
    return;
  }
  
  try {
    const response = await getPostTrendData(type);
    if (response.data.success) {
      const data = response.data.data;
      postGrowthData.value[type] = {
        xAxis: data.xAxis,
        data: data.series
      };
      if (type === postTimeType.value) {
        updatePostChart();
      }
    }
  } catch (error) {
    console.error('获取帖子趋势数据失败:', error);
    postGrowthData.value[type] = {
      xAxis: testPostData[type].xAxis,
      data: testPostData[type].data
    };
    updatePostChart();
  }
};

const fetchViolationType = async (type) => {
  if (isDevelopment) {
    updateViolationChart();
    return;
  }
  
  try {
    const response = await getViolationTypeData(type);
    if (response.data.success) {
      violationTypeData.value[type] = response.data.data;
      if (type === selectedViolationType.value) {
        updateViolationChart();
      }
    }
  } catch (error) {
    console.error('获取举报类型数据失败:', error);
    violationTypeData.value[type] = testViolationData[type];
    updateViolationChart();
  }
};

// 初始化所有数据
const initAllData = async () => {
  if (isDevelopment) {
    console.log('开发环境：使用测试数据');
    return;
  }
  
  try {
    const response = await getHomeDashboardData();
    if (response.data.success) {
      const { userGrowth, postTrend, violationType } = response.data.data;
      
      // 更新所有数据
      userGrowthData.value = userGrowth;
      
      postGrowthData.value = {
        month: { xAxis: postTrend.month.xAxis, data: postTrend.month.series },
        year: { xAxis: postTrend.year.xAxis, data: postTrend.year.series }
      };
      
      violationTypeData.value = violationType;
    }
  } catch (error) {
    console.error('获取首页数据失败，使用测试数据:', error);
  }
};

// 切换函数
const switchUserTimeType = (type) => {
  userTimeType.value = type;
  fetchUserGrowth(type);
};

const switchPostTimeType = (type) => {
  postTimeType.value = type;
  fetchPostTrend(type);
};

// 更新图表函数
const updateUserChart = () => {
  const userChart = echarts.getInstanceByDom(userChartRef.value);
  if (userChart) {
    const data = userGrowthData.value[userTimeType.value];
    userChart.setOption({
      title: { 
        text: '用户增长趋势',
        left: 'center',
        top: 10
      },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category', 
        data: data.xAxis 
      },
      yAxis: { type: 'value' },
      series: [{ 
        name: '用户数', 
        type: 'line', 
        data: data.data,
        smooth: true,
        lineStyle: { width: 3 },
        itemStyle: { borderWidth: 2 }
      }]
    });
  }
};

const updatePostChart = () => {
  const postChart = echarts.getInstanceByDom(postChartRef.value);
  if (postChart) {
    const data = postGrowthData.value[postTimeType.value];
    postChart.setOption({
      title: {
        text: '各类帖子数量趋势',
        left: 'center',
        top: 10
      },
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['技术', '生活', '娱乐', '总帖子数'],
        bottom: 10,
        left: 'center'
      },
      xAxis: { type: 'category', data: data.xAxis },
      yAxis: { type: 'value' },
      series: [
        { name: '技术', type: 'line', data: data.data['技术'], smooth: true },
        { name: '生活', type: 'line', data: data.data['生活'], smooth: true },
        { name: '娱乐', type: 'line', data: data.data['娱乐'], smooth: true },
        {
          name: '总帖子数',
          type: 'line',
          data: data.data['总帖子数'],
          smooth: true,
          lineStyle: { width: 3, type: 'dashed' },
          itemStyle: { borderWidth: 2 }
        }
      ]
    });
  }
};

const updateViolationChart = () => {
  const violationChart = echarts.getInstanceByDom(violationChartRef.value);
  if (violationChart) {
    violationChart.setOption({
      title: { text: '举报类型占比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { bottom: 10, left: 'center' },
      series: [{
        name: '举报类型',
        type: 'pie',
        radius: '60%',
        data: violationTypeData.value[selectedViolationType.value]
      }]
    });
  }
};

// 初始化图表
const initCharts = () => {
  charts.user = echarts.init(userChartRef.value);
  updateUserChart();
  
  charts.post = echarts.init(postChartRef.value);
  updatePostChart();
  
  charts.violation = echarts.init(violationChartRef.value);
  updateViolationChart();
};

// 初始化地图（简化版）
const initMap = async () => {
  // 地图初始化代码...
};

// 监听数据变化
watch(selectedViolationType, (newType) => {
  fetchViolationType(newType);
});

// 组件挂载
onMounted(async () => {
  try {
    // 获取数据
    await initAllData();
    
    // 初始化图表
    initCharts();
    
    // 初始化地图
    await initMap();
  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    isLoading.value = false;
  }
});

// 组件卸载
onUnmounted(() => {
  // 清理图表
  Object.values(charts).forEach(chart => {
    if (chart) {
      chart.dispose();
    }
  });
  
  // 清理地图
  if (map) {
    map.destroy();
  }
});
</script>

<style scoped>
/* 样式代码... */
</style>
`; 