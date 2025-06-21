<template>
  <div class="page-content ">
    <div class="charts-wrapper">
      <div class="chart card-style">
        <div class="chart-title">
          <div class="time-switch">
            <button 
              class="chart-switch-btn" 
              :class="{ active: userTimeType === 'month' }" 
              @click="switchUserTimeType('month')"
            >月度</button>
            <button 
              class="chart-switch-btn" 
              :class="{ active: userTimeType === 'year' }" 
              @click="switchUserTimeType('year')"
            >年度</button>
          </div>
        </div>
        <div ref="userChartRef" class="chart-content" />
      </div>
      <div class="chart card-style">
        <div class="chart-title">
          <div class="time-switch">
            <button 
              class="chart-switch-btn" 
              :class="{ active: postTimeType === 'month' }" 
              @click="switchPostTimeType('month')"
            >月度</button>
            <button 
              class="chart-switch-btn" 
              :class="{ active: postTimeType === 'year' }" 
              @click="switchPostTimeType('year')"
            >年度</button>
          </div>
        </div>
        <div ref="postChartRef" class="chart-content" />
      </div>
      <div class="chart card-style">
        <div class="chart-title">
          <div class="violation-type-switch">
            <button
              v-for="option in violationTypeOptions"
              :key="option.value"
              class="chart-switch-btn"
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
    <div id="mapContainer" class="map-container" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import { 
  getUserGrowthData, 
  getPostTrendData, 
  getViolationTypeData,
  getHomeStats,
  getPostLocations,
  testUserGrowthData,
  testViolationTypeData
} from '@/api/home';

// 合并 reasonText 工具函数
function reasonText(reason) {
  const map = {
    0: '违法内容',
    1: '垃圾广告',
    2: '人身攻击',
    3: '涉政内容',
    4: '侵犯隐私',
    5: '色情内容',
    6: '虚假信息',
    7: '引战言论',
    8: '其他'
  };
  return map[Number(reason)] || '未知';
}

const userChartRef = ref(null);
const postChartRef = ref(null);
const violationChartRef = ref(null);

let map = null;       // 地图实例
let locaLayer = null; // Loca点云层实例

const userTimeType = ref('month');
const postTimeType = ref('month');

// 数据存储
const userGrowthData = ref({
  xAxis: [],
  data: []
});
const postGrowthData = ref({
  xAxis: [],
  series: []
});
const violationTypeData = ref([]);
const stats = ref({
  totalUsers: 0,
  totalPosts: 0,
  totalComments: 0,
  totalViolations: 0
});

const violationTypeOptions = [
  { label: '用户', value: 'user' },
  { label: '帖子', value: 'post' },
  { label: '评论', value: 'comment' }
];
const selectedViolationType = ref('user');

const isLoading = ref(false);
let charts = {
  user: null,
  post: null,
  violation: null
};

let refreshTimer = null;

const violationTypeMap = {
  0: '违法',
  1: '广告',
  2: '攻击',
  3: '涉政',
  4: '其他'
};

function startAutoRefresh() {
  refreshTimer = setInterval(() => {
    fetchUserGrowthData();
    fetchPostTrendData();
    fetchViolationTypeData();
    fetchStats();
  }, 600000); // 10分钟刷新一次
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// 切换用户增长时间类型
const switchUserTimeType = async (type) => {
  userTimeType.value = type;
  await fetchUserGrowthData();
};

// 获取用户增长数据
const fetchUserGrowthData = async () => {
  try {
    // 临时测试开关 - 设置为 true 使用测试数据，false 使用真实API
    const useTestData = true; // 临时改为true来测试映射功能
    
    let res;
    if (useTestData) {
      res = await testUserGrowthData(userTimeType.value);
    } else {
      res = await getUserGrowthData(userTimeType.value);
    }
    
    // 验证数据结构
    if (!res || !res.data) {
      console.error('[Home.vue] API返回数据为空或格式错误:', res);
      userGrowthData.value = { xAxis: [], data: [] };
      updateUserGrowthChart();
      return;
    }
    
    userGrowthData.value = res.data;
    updateUserGrowthChart();
  } catch (error) {
    console.error('[Home.vue] 获取用户增长数据失败:', error);
    console.error('[Home.vue] 错误堆栈:', error.stack);
    // 设置空数据以防止图表错误
    userGrowthData.value = {
      xAxis: [],
      data: []
    };
    updateUserGrowthChart();
  }
};

// 更新用户增长图表
const updateUserGrowthChart = () => {
  console.log('[Home.vue] ========== 开始更新用户增长图表 ==========');
  console.log('[Home.vue] userGrowthData.value:', userGrowthData.value);
  
  const userChart = charts.user;
  console.log('[Home.vue] 用户图表实例存在:', !!userChart);
  console.log('[Home.vue] 用户图表实例类型:', typeof userChart);
  
  if (!userChart) {
    console.error('[Home.vue] ❌ 用户图表实例不存在，无法更新');
    return;
  }
  
  const data = userGrowthData.value;
  console.log('[Home.vue] 图表数据:', data);
  console.log('[Home.vue] 数据类型:', typeof data);
  console.log('[Home.vue] 是否为对象:', data && typeof data === 'object');
  
  // 处理空数据情况
  const hasData = data && data.xAxis && data.xAxis.length > 0;
  console.log('[Home.vue] hasData 检查:', hasData);
  console.log('[Home.vue] data.xAxis:', data?.xAxis);
  console.log('[Home.vue] data.xAxis.length:', data?.xAxis?.length);
  console.log('[Home.vue] data.data:', data?.data);
  console.log('[Home.vue] data.data.length:', data?.data?.length);
  
  const chartData = hasData ? data.data : [];
  const xAxisData = hasData ? data.xAxis : [];
  
  console.log('[Home.vue] 最终图表数据:');
  console.log('[Home.vue] - xAxisData:', xAxisData);
  console.log('[Home.vue] - chartData:', chartData);
  
  try {
    const chartOption = {
      color: ['#4dabf7', '#f783ac', '#69db7c', '#ff6b6b', '#fab005'],
      title: { 
        text: '用户增长趋势',
        left: 'center',
        top: 10,
        textStyle: { color: '#222' }
      },
      tooltip: { trigger: 'axis', textStyle: { color: '#222' } },
      xAxis: { 
        type: 'category', 
        data: xAxisData,
        axisLine: { lineStyle: { color: '#888' } },
        axisTick: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#222' }
      },
      yAxis: { 
        type: 'value',
        axisLine: { lineStyle: { color: '#888' } },
        axisTick: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#222' }
      },
      series: [{ 
        name: '用户数', 
        type: 'line', 
        data: chartData,
        smooth: true,
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          borderWidth: 2
        }
      }],
      // 添加空数据提示
      graphic: hasData ? null : {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: '暂无数据',
          fontSize: 16,
          fill: '#999'
        }
      }
    };
    
    console.log('[Home.vue] ECharts 配置:', chartOption);
    console.log('[Home.vue] 正在设置图表配置...');
    
    userChart.setOption(chartOption);
    console.log('[Home.vue] ✅ 图表配置设置完成');
    
  } catch (error) {
    console.error('[Home.vue] ❌ 设置图表配置时发生错误:', error);
    console.error('[Home.vue] 错误堆栈:', error.stack);
  }
  
  console.log('[Home.vue] ========== 用户增长图表更新结束 ==========');
};

// 切换帖子增长时间类型
const switchPostTimeType = async (type) => {
  postTimeType.value = type;
  await fetchPostTrendData();
};

// 获取帖子趋势数据
const fetchPostTrendData = async () => {
  try {
    console.log('[Home.vue] 准备获取帖子趋势数据, 时间类型:', postTimeType.value);
    const res = await getPostTrendData(postTimeType.value);
    console.log('[Home.vue] 接收到帖子趋势数据:', res.data);
    postGrowthData.value = res.data;
    updatePostTrendChart();
  } catch (error) {
    console.error('获取帖子趋势数据失败:', error);
    // 设置空数据以防止图表错误
    postGrowthData.value = {
      xAxis: [],
      categories: [],
      series: []
    };
    updatePostTrendChart();
  }
};

// 更新帖子增长图表
const updatePostTrendChart = () => {
  console.log('[Home.vue] 开始更新帖子增长图表');
  const postChart = charts.post;
  console.log('[Home.vue] 帖子图表实例存在:', !!postChart);
  
  if (postChart) {
    const data = postGrowthData.value;
    console.log('[Home.vue] 更新帖子增长图表，数据:', data);
    
    // 处理空数据情况
    const hasData = data && data.xAxis && data.xAxis.length > 0;
    const xAxisData = hasData ? data.xAxis : [];
    const categories = hasData ? (data.categories || []) : [];
    const series = hasData ? (data.series || []) : [];
    
    console.log('[Home.vue] 帖子图表处理后的数据:', { hasData, xAxisData, categories, series });
    
    // 构造所有分类的series
    const seriesArr = [];
    const legendData = [];
    
    if (hasData && categories.length > 0 && series.length > 0) {
      // 添加分类数据
      categories.forEach((cat, idx) => {
        if (series[idx]) {
          seriesArr.push({
            name: cat,
            type: 'line',
            data: series[idx],
            smooth: true,
            lineStyle: { width: 2 },
            symbol: 'circle',
            symbolSize: 6
          });
          legendData.push(cat);
        }
      });
      
      // 添加总帖子数（最后一个series）
      if (series.length > categories.length) {
        seriesArr.push({
          name: '总帖子数',
          type: 'line',
          data: series[series.length - 1],
          smooth: true,
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 8
        });
        legendData.push('总帖子数');
      }
      
      console.log('[Home.vue] 帖子图表series配置:', seriesArr);
      console.log('[Home.vue] 帖子图表legend数据:', legendData);
    }
    
    postChart.setOption({
      color: ['#4dabf7', '#f783ac', '#69db7c', '#ff6b6b', '#fab005'],
      title: {
        text: '帖子数量趋势',
        left: 'center',
        top: 10,
        textStyle: { color: '#222' }
      },
      tooltip: { trigger: 'axis', textStyle: { color: '#222' } },
      legend: {
        data: legendData,
        bottom: 10,
        left: 'center',
        textStyle: { color: '#222' }
      },
      xAxis: { 
        type: 'category', 
        data: xAxisData,
        axisLine: { lineStyle: { color: '#888' } },
        axisTick: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#222' }
      },
      yAxis: { 
        type: 'value',
        axisLine: { lineStyle: { color: '#888' } },
        axisTick: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#222' }
      },
      series: seriesArr,
      // 添加空数据提示
      graphic: hasData ? null : {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: '暂无数据',
          fontSize: 16,
          fill: '#999'
        }
      }
    });
    
    console.log('[Home.vue] 帖子增长图表配置设置完成');
  } else {
    console.warn('[Home.vue] 帖子图表实例不存在，无法更新图表');
  }
};

// 获取举报类型数据
const fetchViolationTypeData = async () => {
  try {
    console.log('[Home.vue] 准备获取举报类型数据, 举报类型:', selectedViolationType.value);
    
    // 临时测试开关 - 设置为 true 使用测试数据，false 使用真实API
    const useTestData = false; // 可以改为true来测试图表功能
    
    let res;
    if (useTestData) {
      console.log('[Home.vue] 使用举报类型测试数据');
      res = await testViolationTypeData(selectedViolationType.value);
      console.log('[Home.vue] 举报类型测试数据API返回:', res);
    } else {
      console.log('[Home.vue] 使用举报类型真实API数据');
      res = await getViolationTypeData(selectedViolationType.value);
      console.log('[Home.vue] 举报类型真实API返回:', res);
    }
    
    console.log('[Home.vue] 接收到举报类型数据:', res);
    console.log('[Home.vue] 举报类型数据详情:', res.data);
    
    // 检查数据结构
    if (!res || !res.data) {
      console.error('[Home.vue] 举报类型API返回数据为空或格式错误:', res);
      violationTypeData.value = [];
      updateViolationTypeChart();
      return;
    }
    
    // 后端返回的数据格式已经是 [{name: "...", value: ...}] 格式
    // 直接使用，不需要转换
    violationTypeData.value = res.data;
    console.log('[Home.vue] 设置 violationTypeData.value:', violationTypeData.value);
    
    updateViolationTypeChart();
  } catch (error) {
    console.error('[Home.vue] 获取举报类型数据失败:', error);
    console.error('[Home.vue] 举报类型错误堆栈:', error.stack);
    // 设置空数据以防止图表错误
    violationTypeData.value = [];
    updateViolationTypeChart();
  }
};

// 更新举报类型图表
const updateViolationTypeChart = () => {
  console.log('[Home.vue] ========== 开始更新举报类型图表 ==========');
  console.log('[Home.vue] violationTypeData.value:', violationTypeData.value);
  
  const violationChart = charts.violation;
  console.log('[Home.vue] 举报类型图表实例存在:', !!violationChart);
  console.log('[Home.vue] 举报类型图表实例类型:', typeof violationChart);
  
  if (!violationChart) {
    console.error('[Home.vue] ❌ 举报类型图表实例不存在，无法更新');
    return;
  }
  
  const data = violationTypeData.value;
  console.log('[Home.vue] 举报类型图表数据:', data);
  console.log('[Home.vue] 数据类型:', typeof data);
  console.log('[Home.vue] 是否为数组:', Array.isArray(data));
  console.log('[Home.vue] 数据长度:', data?.length);
  
  // 处理空数据情况
  const hasData = data && Array.isArray(data) && data.length > 0;
  console.log('[Home.vue] 举报类型 hasData 检查:', hasData);
  
  if (hasData) {
    console.log('[Home.vue] 举报类型数据详情:', data);
    data.forEach((item, index) => {
      console.log(`[Home.vue] 举报类型数据项${index}:`, item, '名称:', item.name, '数值:', item.value);
    });
  }
  
  try {
    // 为"其他"项设置特殊颜色
    const processedData = hasData ? data.map((item, index) => {
      if (item.name === '其他') {
        console.log('[Home.vue] 为"其他"项设置主品牌色:', item);
        return {
          ...item,
          itemStyle: {
            color: '#ff4500' // 主品牌色
          }
        };
      }
      return item;
    }) : [];
    
    const chartOption = {
      color: ['#4dabf7', '#f783ac', '#69db7c', '#ff6b6b', '#fab005'],
      title: { 
        text: '举报类型占比', 
        left: 'center', 
        textStyle: { color: '#222' } 
      },
      tooltip: { 
        trigger: 'item', 
        textStyle: { color: '#222' },
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: { 
        bottom: 10, 
        left: 'center', 
        textStyle: { color: '#222' } 
      },
      series: [{
        name: '举报类型',
        type: 'pie',
        radius: '60%',
        data: processedData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      // 添加空数据提示
      graphic: hasData ? null : {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: '暂无数据',
          fontSize: 16,
          fill: '#999'
        }
      }
    };
    
    console.log('[Home.vue] 举报类型ECharts 配置:', chartOption);
    console.log('[Home.vue] 正在设置举报类型图表配置...');
    
    violationChart.setOption(chartOption);
    console.log('[Home.vue] ✅ 举报类型图表配置设置完成');
    
  } catch (error) {
    console.error('[Home.vue] ❌ 设置举报类型图表配置时发生错误:', error);
    console.error('[Home.vue] 举报类型错误堆栈:', error.stack);
  }
  
  console.log('[Home.vue] ========== 举报类型图表更新结束 ==========');
};

// 动态加载JS脚本
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// 等待全局变量可用
function waitForGlobal(globalName, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (window[globalName]) {
      resolve(window[globalName]);
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window[globalName]) {
        clearInterval(checkInterval);
        resolve(window[globalName]);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error(`等待 ${globalName} 超时`));
      }
    }, 100);
  });
}

// 地图初始化
async function initMap() {
  try {
    // 加载AMap主库
    await loadScript('https://webapi.amap.com/maps?v=1.4.15&key=c5e324aed119743841396feded4098d2');
    
    // 等待AMap全局变量可用
    await waitForGlobal('AMap');
    
    // 加载Loca库
    await loadScript('https://webapi.amap.com/loca?v=1.3.2&key=c5e324aed119743841396feded4098d2');
    
    // 等待Loca全局变量可用
    await waitForGlobal('Loca');
    
    // 确保库已加载
    if (!window.AMap || !window.Loca) {
      throw new Error('地图库加载失败');
    }
    
    console.log('地图库加载成功');
    
    // 创建地图实例
    map = new window.AMap.Map('mapContainer', {
      mapStyle: 'amap://styles/normal',
      zoom: 4.5,
      center: [108.9082, 37.9452],
      showLabel: false,
      features: ['bg', 'road'],
      minZoom: 4,
      maxZoom: 8,
      zoomEnable: true,
      dragEnable: true
    });

    // 创建散点图层
    locaLayer = new window.Loca.ScatterPointLayer({
      map: map
    });

    // 加载帖子位置数据并渲染
    await renderPostLocations();
    
    console.log('地图初始化完成');
    
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
}

// 渲染帖子位置散点
async function renderPostLocations() {
  try {
    const locations = await getPostLocations();
    // console.log('🗺️ 开始渲染位置数据:', locations.length, '个点');
    
    if (locations.length === 0) {
      // console.warn('⚠️ 没有位置数据可渲染');
      return;
    }
    
    // 设置Loca数据
    locaLayer.setData(locations, {
      lnglat: ['lng', 'lat']
    });

    // 设置散点样式
    locaLayer.setOptions({
      unit: 'px',
      style: {
        radius: 4,
        color: 'rgba(255, 69, 0, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        opacity: 0.9,
        glow: {
          color: 'rgba(255, 69, 0, 0.6)',
          radius: 6,
          opacity: 0.7
        }
      }
    });

    // 渲染散点图层
    locaLayer.render();
    console.log('✅ 散点图层渲染完成');
    
  } catch (error) {
    console.error('❌ 渲染帖子位置失败:', error);
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await getHomeStats();
    stats.value = res.data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

// 初始化所有数据
const initAllData = async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      fetchUserGrowthData(),
      fetchPostTrendData(),
      fetchViolationTypeData(),
      fetchStats()
    ]);
  } catch (error) {
    console.error('初始化数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 监听数据变化
watch(selectedViolationType, () => {
  fetchViolationTypeData();
});

// 组件挂载时初始化
onMounted(() => {
  console.log('[Home.vue] ========== 组件挂载开始 ==========');
  console.log('[Home.vue] userChartRef.value:', userChartRef.value);
  console.log('[Home.vue] userChartRef DOM元素存在:', !!userChartRef.value);
  console.log('[Home.vue] userChartRef DOM元素类型:', userChartRef.value?.tagName);
  console.log('[Home.vue] userChartRef DOM元素尺寸:', {
    width: userChartRef.value?.offsetWidth,
    height: userChartRef.value?.offsetHeight
  });
  
  console.log('[Home.vue] 开始初始化图表实例...');
  
  try {
    charts.user = echarts.init(userChartRef.value);
    console.log('[Home.vue] ✅ 用户图表初始化成功:', !!charts.user);
  } catch (error) {
    console.error('[Home.vue] ❌ 用户图表初始化失败:', error);
  }
  
  try {
    charts.post = echarts.init(postChartRef.value);
    console.log('[Home.vue] ✅ 帖子图表初始化成功:', !!charts.post);
  } catch (error) {
    console.error('[Home.vue] ❌ 帖子图表初始化失败:', error);
  }
  
  try {
    charts.violation = echarts.init(violationChartRef.value);
    console.log('[Home.vue] ✅ 举报图表初始化成功:', !!charts.violation);
  } catch (error) {
    console.error('[Home.vue] ❌ 举报图表初始化失败:', error);
  }
  
  console.log('[Home.vue] 图表实例初始化完成:', {
    user: !!charts.user,
    post: !!charts.post,
    violation: !!charts.violation
  });
  
  console.log('[Home.vue] 开始初始化地图...');
  // 初始化地图
  initMap();
  
  console.log('[Home.vue] 开始初始化数据...');
  // 初始化数据
  initAllData();
  
  console.log('[Home.vue] 启动定时刷新...');
  // 启动定时刷新
  startAutoRefresh();
  
  // 优化resize事件监听器，添加passive选项
  const handleResize = () => {
    console.log('[Home.vue] 窗口大小改变，调整图表大小');
    charts.user?.resize();
    charts.post?.resize();
    charts.violation?.resize();
    map?.resize && map.resize();
  };
  
  window.addEventListener('resize', handleResize, { passive: true });
  
  // 存储处理器引用用于清理
  window._chartResizeHandler = handleResize;
  
  console.log('[Home.vue] ========== 组件挂载完成 ==========');
});

// 组件卸载时清理
onUnmounted(() => {
  stopAutoRefresh();
  Object.values(charts).forEach(chart => {
    if (chart) chart.dispose();
  });
  if (locaLayer) {
    if (typeof locaLayer.clear === 'function') locaLayer.clear(); // 清空点云层
    if (typeof locaLayer.remove === 'function') locaLayer.remove(); // 从地图移除点云层
    locaLayer = null;
  }
  if (map) map.destroy();
  // 正确移除resize事件监听器
  if (window._chartResizeHandler) {
    window.removeEventListener('resize', window._chartResizeHandler);
    delete window._chartResizeHandler;
  }
});
</script>

<style scoped>
/* 删除所有自定义 box-shadow 样式 */

.page-content {
  padding: var(--spacing-xl);
  font-family: inherit;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1 1 auto;
  min-height: 0;
}
.charts-wrapper {
  min-height: 40%;
  display: flex;
  gap: var(--spacing-lg);
  height: 400px;
  background: none;
  border-radius: 0;
}
.chart {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-sizing: border-box;
  height: 100%;
  width: 33.33%;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}
/* 地图样式 */
.map-container {
  width: 100%;
  min-height: 900px;
  border-radius: var(--border-radius);
  background: var(--card-bg);
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}

.chart-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.time-switch,
.violation-type-switch {
  display: flex;
  gap: var(--spacing-xs);
  background: var(--background-color);
  padding: var(--spacing-xs);
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.chart-switch-btn {
  background: transparent;
  color: var(--foreground-muted);
  border-radius: 16px;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  letter-spacing: -0.2px;
}

.chart-switch-btn.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 69, 0, 0.25);
}

.chart-switch-btn:hover:not(.active) {
  background: rgba(255, 69, 0, 0.08);
  color: var(--primary-color);
}

.chart-content {
  height: calc(100% - 60px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .charts-wrapper {
    flex-direction: column;
    height: auto;
    gap: var(--spacing-lg);
  }
  .chart {
    width: 100%;
    min-height: 300px;
  }
  .map-container {
    min-height: 500px;
  }
}
@media (max-width: 768px) {
  .page-content {
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
  }
  .charts-wrapper {
    gap: var(--spacing-md);
  }
  .chart {
    width: 100%;
    min-height: 250px;
    padding: var(--spacing-md);
  }
  .map-container {
    min-height: 400px;
  }
  .time-switch,
  .violation-type-switch {
    flex-wrap: wrap;
  }
  .chart-switch-btn {
    font-size: 12px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>