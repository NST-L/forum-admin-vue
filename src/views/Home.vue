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
import { ref, onMounted, onUnmounted, h, createApp, watch } from 'vue';
import * as echarts from 'echarts';
import InfoWindowContent from '@/components/InfoWindowContent.vue';
import { 
  getUserGrowthData, 
  getPostTrendData, 
  getViolationTypeData,
  getHomeStats
} from '@/api/home';
import { mapHeatData } from '@/data/mapHeatData';

const userChartRef = ref(null);
const postChartRef = ref(null);
const violationChartRef = ref(null);

let map = null;       // 地图实例
let vLayer = null;    // 行政区热力图层实例
let infoWin = null;   // 信息窗口实例

// 事件处理函数引用
let vLayerClickHandler = null;
let upBtnHandler = null;
let vLayerMousemoveHandler = null;

const infoContentData = ref({
  name: '',
  value: '',
  childrenNum: 0,
  adcode: ''
});
const infoContentVisible = ref(false);
const infoContentPos = ref({ left: 0, top: 0 });
let infoContentApp = null;
let infoContentEl = null;

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

// 切换用户增长时间类型
const switchUserTimeType = async (type) => {
  userTimeType.value = type;
  await fetchUserGrowthData();
};

// 获取用户增长数据
const fetchUserGrowthData = async () => {
  try {
    const res = await getUserGrowthData(userTimeType.value);
    if (res.data.success) {
      userGrowthData.value = res.data.data;
      updateUserGrowthChart();
    }
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
    if (res.data.success) {
      postGrowthData.value = res.data.data;
      updatePostTrendChart();
    }
  } catch (error) {
    console.error('获取帖子趋势数据失败:', error);
  }
};

// 更新帖子增长图表
const updatePostTrendChart = () => {
  const postChart = echarts.getInstanceByDom(postChartRef.value);
  if (postChart && postGrowthData.value.xAxis.length > 0) {
    const data = postGrowthData.value;
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
        {
          name: '技术',
          type: 'line',
          data: data.series[0],
          smooth: true
        },
        {
          name: '生活',
          type: 'line',
          data: data.series[1],
          smooth: true
        },
        {
          name: '娱乐',
          type: 'line',
          data: data.series[2],
          smooth: true
        },
        {
          name: '总帖子数',
          type: 'line',
          data: data.series[3],
          smooth: true
        }
      ]
    });
  }
};

// 获取举报类型数据
const fetchViolationTypeData = async () => {
  try {
    const res = await getViolationTypeData(selectedViolationType.value);
    if (res.data.success) {
      violationTypeData.value = res.data.data;
      updateViolationTypeChart();
    }
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

// 地图初始化
async function initMap() {
  await Promise.all([
    loadScript('https://webapi.amap.com/maps?v=1.4.15&key=c5e324aed119743841396feded4098d2'),
    loadScript('https://webapi.amap.com/loca?v=1.3.2&key=c5e324aed119743841396feded4098d2'),
    loadScript('https://a.amap.com/Loca/static/dist/jquery.min.js')
  ]).then(() => {
    // eslint-disable-next-line
    map = new window.AMap.Map('mapContainer', {
      mapStyle: 'amap://styles/whitesmoke',
      viewMode: '2D',
      center: [104.114129, 37.550339],
      zoom: 4,
      showLabel: false
    });
    // eslint-disable-next-line
    vLayer = new window.Loca.DistrictLayer({
      fitView: true,
      eventSupport: true,
      drillDown: true,
      map: map,
      zIndex: 4,
      opacity: 0.9,
      depth: false,
      text: false,
      drillDownDuration: 30
    });
    // 鼠标悬浮显示信息窗口
    vLayerMousemoveHandler = function (ev) {
      if (!ev.feature) {
        infoContentVisible.value = false;
        return;
      }
      const originalEv = ev.originalEvent;
      const lnglat = map.containerToLngLat(new window.AMap.Pixel(originalEv.clientX, originalEv.clientY));
      const feature = ev.feature;
      const value = ev.value;
      const property = feature.subFeature.properties;
      infoContentData.value = {
        name: property.name,
        value: value,
        childrenNum: property.childrenNum,
        adcode: property.adcode
      };
      const mapRect = document.getElementById('mapContainer').getBoundingClientRect();
      infoContentPos.value = {
        left: originalEv.clientX - mapRect.left,
        top: originalEv.clientY - mapRect.top
      };
      infoContentVisible.value = true;
    };
    vLayer.on('mousemove', vLayerMousemoveHandler);
    vLayer.on('mouseout', function () {
      infoContentVisible.value = false;
    });
    // 点击事件
    vLayerClickHandler = function (ev) {
      // 可扩展：点击下钻等
    };
    vLayer.on('click', vLayerClickHandler);
    // 上浮按钮
    upBtnHandler = function () {
      vLayer.goto(-1);
    };
    const upBtn = document.getElementById('up-btn');
    if (upBtn) {
      upBtn.addEventListener('click', upBtnHandler);
    }
    // 加载和渲染热力数据（使用本地 mapHeatData 数据）
    vLayer.setData(mapHeatData.rows, {
      type: 'json',
      lnglat: '经纬度',
      value: '区域帖子数量'
    });
    vLayer.setOptions({
      mode: 'count',
      style: {
        color: [
          '#0c2c84', '#225ea8', '#225ea8', '#41b6c4', '#7fcdbb', '#c7e9b4', '#ffffcc'
        ],
        height: (index, feature) => {
          const val = feature.value;
          return val ? val * 5000 : 0;
        },
        topColor: '#ffffcc',
        bottomColor: '#0c2c84',
        borderColor: '#2a2a32',
        borderWidth: 1
      },
      selectStyle: false
    });
    vLayer.render();
  });
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await getHomeStats();
    if (res.data.success) {
      stats.value = res.data.data;
    }
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
  window.addEventListener('resize', () => {
    charts.user?.resize();
    charts.post?.resize();
    charts.violation?.resize();
    map?.resize && map.resize();
  });
});

// 组件卸载时清理
onUnmounted(() => {
  Object.values(charts).forEach(chart => {
    if (chart) chart.dispose();
  });
  if (map) map.destroy();
  if (vLayer && vLayerClickHandler) vLayer.off('click', vLayerClickHandler);
  if (vLayer && vLayerMousemoveHandler) vLayer.off('mousemove', vLayerMousemoveHandler);
  if (upBtnHandler) {
    const upBtn = document.getElementById('up-btn');
    if (upBtn) upBtn.removeEventListener('click', upBtnHandler);
  }
  window.removeEventListener('resize', () => {});
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
  transition: height 0.3s ease;
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
}
/* 左上角信息窗口固定样式 */
.map-info-window-fixed {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 20;
}
/* 左下角上浮按钮固定样式 */
.map-up-btn-fixed {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 20;
}
.button {
  padding: 8px 16px;
  background-color: #2181ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}
.button:hover {
  background-color: #0d6efd;
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
  transition: all 0.3s ease;
}

.time-switch button.active {
  background: #DAE0E6;
  color: #000;
}

.chart-content {
  height: calc(100% - 40px);
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #DAE0E6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  transition: all 0.3s ease;
}
.violation-type-switch button.active {
  background: #DAE0E6;
  color: #000;
}

/* 地图信息框关闭按钮样式 */
.amap-info-close {
  color: #000000;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  font-size: 16px;
  line-height: 18px;
  text-align: center;
  border-radius: 50%;
}

.amap-info-close:hover {
  color: #f0f2ff;
  background: rgba(255, 255, 255, 0.1);
}
</style>