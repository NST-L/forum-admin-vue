<template>
  <div class="page-content">
    <div class="charts-wrapper">
      <div class="chart">
        <div class="chart-title">
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
      <div class="chart">
        <div class="chart-title">
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
      <div class="chart">
        <div class="chart-title">
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
    <div class="map-container-wrapper">
      <div id="mapContainer" class="map-container" />
    </div>
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
  getPostLocationsCSV
} from '@/api/home';
import { reasonText } from '@/utils/reason'

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
    const res = await getUserGrowthData(userTimeType.value);
    userGrowthData.value = res.data;
    updateUserGrowthChart();
  } catch (error) {
    console.error('获取用户增长数据失败:', error);
  }
};

// 更新用户增长图表
const updateUserGrowthChart = () => {
  const userChart = echarts.getInstanceByDom(userChartRef.value);
  if (userChart && userGrowthData.value.xAxis.length > 0) {
    const data = userGrowthData.value;
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
        lineStyle: {
          width: 3
        },
        itemStyle: {
          borderWidth: 2
        }
      }]
    });
  }
};

// 切换帖子增长时间类型
const switchPostTimeType = async (type) => {
  postTimeType.value = type;
  await fetchPostTrendData();
};

// 获取帖子趋势数据
const fetchPostTrendData = async () => {
  try {
    const res = await getPostTrendData(postTimeType.value);
    postGrowthData.value = res.data;
    updatePostTrendChart();
  } catch (error) {
    console.error('获取帖子趋势数据失败:', error);
  }
};

// 更新帖子增长图表
const updatePostTrendChart = () => {
  const postChart = echarts.getInstanceByDom(postChartRef.value);
  if (postChart && postGrowthData.value.xAxis.length > 0) {
    const data = postGrowthData.value;
    // 构造所有分类的series
    const seriesArr = data.categories.map((cat, idx) => ({
      name: cat,
      type: 'line',
      data: data.series[idx],
      smooth: true
    }));
    // 添加总帖子数
    seriesArr.push({
      name: '总帖子数',
      type: 'line',
      data: data.series[data.series.length - 1],
      smooth: true
    });
    postChart.setOption({
      title: {
        text: '各类帖子数量趋势',
        left: 'center',
        top: 10
      },
      tooltip: { trigger: 'axis' },
      legend: {
        data: [...data.categories, '总帖子数'],
        bottom: 10,
        left: 'center'
      },
      xAxis: { type: 'category', data: data.xAxis },
      yAxis: { type: 'value' },
      series: seriesArr
    });
  }
};

// 获取举报类型数据
const fetchViolationTypeData = async () => {
  try {
    const res = await getViolationTypeData(selectedViolationType.value);
    // 只保留 name 和 value 字段，name 优先 reasonText，否则用后端 name
    violationTypeData.value = (res.data || []).map(item => ({
      name: reasonText(item.type) || item.name,
      value: item.value
    }));
    updateViolationTypeChart();
  } catch (error) {
    console.error('获取举报类型数据失败:', error);
  }
};

// 更新举报类型图表
const updateViolationTypeChart = () => {
  const violationChart = echarts.getInstanceByDom(violationChartRef.value);
  if (violationChart && violationTypeData.value.length > 0) {
    const data = violationTypeData.value;
    violationChart.setOption({
      title: { text: '举报类型占比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { bottom: 10, left: 'center' },
      series: [{
        name: '举报类型',
        type: 'pie',
        radius: '60%',
        data: data
      }]
    });
  }
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
    
    // 加载jQuery（可选，某些功能可能需要）
    await loadScript('https://a.amap.com/Loca/static/dist/jquery.min.js');
    
    // 确保库已加载
    if (!window.AMap || !window.Loca) {
      throw new Error('地图库加载失败');
    }
    
    console.log('地图库加载成功');
    
    // 创建地图实例 - 调整为武汉市中心
    map = new window.AMap.Map('mapContainer', {
      mapStyle: 'amap://styles/light', // 使用浅色主题
      viewMode: '2D',
      center: [103.388611, 35.563611], // 中国地图中心点
      zoom: 4.5, // 适合展示整个中国地图
      showLabel: false, // 关闭标签，突出光点效果
      features: ['bg','road','point'], // 显示背景和道路
      // 性能优化配置
      animateEnable: false,
      jogEnable: false,
      scrollWheel: true,
      doubleClickZoom: true,
      keyboardEnable: false,
      dragEnable: true,
      zoomEnable: true,
      rotateEnable: false,
      pitchEnable: false,
      resizeEnable: true,
      showIndoorMap: false
    });
    
    // 加载帖子位置数据并渲染
    await renderPostLocations();
    
    console.log('地图初始化完成');
    
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
}

// 渲染帖子位置光点
async function renderPostLocations() {
  try {
    // 获取帖子位置CSV数据
    const res = await getPostLocationsCSV();
    const csvData = res.data;
    console.log('帖子位置数据已加载');
    // 创建点云层
    locaLayer = new window.Loca.PointCloudLayer({
      map: map,
      fitView: false
    });
    // 设置数据
    locaLayer.setData(csvData, {
      lnglat: function (obj) {
        const value = obj.value;
        return [value['lng'], value['lat']];
      },
      type: 'csv'
    });
    // 设置样式 - 红色系热力图效果
    locaLayer.setOptions({
      style: {
        opacity: 0.85, // 适中的不透明度
        radius: 100, // 增大光点尺寸，让热力效果更明显
        color: function(index, feature) {
          const colors = [
            'rgba(255, 0, 0, 0.9)',
            'rgba(255, 50, 0, 0.85)',
            'rgba(255, 100, 0, 0.8)',
            'rgba(255, 150, 0, 0.75)',
            'rgba(255, 200, 0, 0.7)',
            'rgba(255, 255, 0, 0.65)',
            'rgba(255, 200, 100, 0.6)',
            'rgba(255, 150, 150, 0.55)'
          ];
          return colors[index % colors.length];
        }
      }
    });
    // 渲染
    locaLayer.render();
    // 添加鼠标事件（可选）
    locaLayer.on('mousemove', function(e) {
      if (e.feature) {
        map.setStatus({ cursor: 'pointer' });
      }
    });
    locaLayer.on('mouseout', function() {
      map.setStatus({ cursor: 'default' });
    });
    console.log('帖子位置光点渲染完成');
  } catch (error) {
    console.error('渲染帖子位置失败:', error);
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
  charts.user = echarts.init(userChartRef.value);
  charts.post = echarts.init(postChartRef.value);
  charts.violation = echarts.init(violationChartRef.value);
  // 初始化地图
  initMap();
  // 初始化数据
  initAllData();
  // 启动定时刷新
  startAutoRefresh();
  
  // 优化resize事件监听器，添加passive选项
  const handleResize = () => {
    charts.user?.resize();
    charts.post?.resize();
    charts.violation?.resize();
    map?.resize && map.resize();
  };
  
  window.addEventListener('resize', handleResize, { passive: true });
  
  // 存储处理器引用用于清理
  window._chartResizeHandler = handleResize;
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
/*  页面容器样式 */
.page-content {
  padding: clamp(1rem, 4vw, 2rem);
  background-color: #DAE0E6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-sizing: border-box;
}
/* 图表容器样式 */
.chart-container {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

/* 图表容器 */
.charts-wrapper {
  display: flex;
  gap: 1.25rem;
  padding: 0 1.25rem 1.25rem;
  height: 25rem;
}
/* 图表容器内部样式 */
.chart {
  height: 100%;
  width: 33.33%;
  background: #f9f9f9;
  border-radius: 0.5rem;
  padding: 0.625rem;
  box-sizing: border-box;
}
/* 地图外层包裹，便于绝对定位 */
.map-container-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  min-height: 0;
  margin-bottom: 4rem;
}
/* 地图样式 */
.map-container {
  flex: 1;
  min-height: 30vh;
  width: 100%;
  border-radius: 0.625rem;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.397);
  /* 优化触摸和滚动性能 */
  touch-action: manipulation;
  will-change: transform;
}

.chart-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 10px;
}

.time-switch {
  display: flex;
  gap: 8px;
}

.time-switch button {
  padding: 4px 12px;
  border: 1px solid #DAE0E6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.time-switch button.active {
  background: #DAE0E6;
  color: #000;
}

.chart-content {
  height: calc(100% - 40px);
}

@media (max-width: 1024px) {
  .charts-wrapper {
    flex-direction: column;
    height: auto;
    gap: 1rem;
    padding: 0 0.5rem 0.5rem;
  }
  .chart {
    width: 100%;
    min-height: 15rem;
  }
}
@media (max-width: 768px) {
  .page-content {
    padding: 0.5rem 0.25rem;
    gap: 0.5rem;
  }
  .charts-wrapper {
    flex-direction: column;
    height: auto;
    gap: 0.5rem;
    padding: 0 0.25rem 0.25rem;
  }
  .chart {
    width: 100%;
    min-height: 12rem;
    padding: 0.25rem;
  }
  .map-container-wrapper {
    margin-bottom: 1rem;
  }
}

.violation-type-switch {
  display: flex;
  gap: 8px;
}
.violation-type-switch button {
  padding: 4px 12px;
  border: 1px solid #DAE0E6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.violation-type-switch button.active {
  background: #DAE0E6;
  color: #000;
}
</style>