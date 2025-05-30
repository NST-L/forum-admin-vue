<template>
  <div class="page-content">
    <div class="chart-container">
      <div class="chart-header" @click="toggleCharts">
        <span>平台核心报表</span>
        <span class="fold-icon">{{ isFolded ? '展开' : '收起' }}</span>
      </div>
      <div class="charts-wrapper" :class="{ 'folded': isFolded }">
        <div ref="userChartRef" class="chart" />
        <div ref="postChartRef" class="chart" />
        <div ref="violationChartRef" class="chart" />
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, h, createApp } from 'vue';
import * as echarts from 'echarts';
import InfoWindowContent from '@/components/InfoWindowContent.vue';

const userChartRef = ref(null);
const postChartRef = ref(null);
const violationChartRef = ref(null);
const isFolded = ref(false);

let map = null;       // 地图实例
let vLayer = null;    // 行政区热力图层实例
let infoWin = null;   // 信息窗口实例

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

const toggleCharts = () => {
  isFolded.value = !isFolded.value;
};

onMounted(() => {
  // 初始化 ECharts 图表
  const userChart = echarts.init(userChartRef.value);
  userChart.setOption({
    title: { text: '月度新用户增长' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'] },
    yAxis: { type: 'value' },
    series: [{ name: '新用户数', type: 'line', data: [120, 200, 150, 80, 70] }]
  });

  const postChart = echarts.init(postChartRef.value);
  postChart.setOption({
    title: { text: '各类帖子数量趋势' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['技术', '生活', '娱乐'] },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'] },
    yAxis: { type: 'value' },
    series: [
      { name: '技术', type: 'line', data: [50, 80, 60, 100, 90] },
      { name: '生活', type: 'line', data: [70, 100, 110, 130, 125] },
      { name: '娱乐', type: 'line', data: [30, 60, 45, 50, 55] }
    ]
  });

  const violationChart = echarts.init(violationChartRef.value);
  violationChart.setOption({
    title: { text: '举报类型占比', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: 10, left: 'center' },
    series: [{
      name: '举报类型',
      type: 'pie',
      radius: '60%',
      data: [
        { value: 45, name: '广告' },
        { value: 25, name: '辱骂' },
        { value: 15, name: '低俗' },
        { value: 15, name: '其他' }
      ]
    }]
  });

  // 动态加载地图及行政区热力图脚本
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  Promise.all([
    loadScript('https://webapi.amap.com/maps?v=1.4.15&key=c5e324aed119743841396feded4098d2'),
    loadScript('https://webapi.amap.com/loca?v=1.3.2&key=c5e324aed119743841396feded4098d2'),
    loadScript('https://a.amap.com/Loca/static/dist/jquery.min.js')
  ]).then(() => {
    /************************ 地图初始化参数详解 ************************/
    // 创建地图实例
    map = new AMap.Map('mapContainer', {
      // 地图样式：使用预定义的主题样式
      mapStyle: 'amap://styles/whitesmoke',
      /*normal:默认白底风格
        dark:暗色商务风格
        light:浅色清新风格
        whitesmoke:高对比黑白
        fresh:青绿色风格
        grey:灰色冷静风 */
      
      // 视图模式：3D 模式提供更好的立体效果
      viewMode: '2D',
      
      // 地图要素：显示背景和道路图层
      features: ['bg'],
      
      // 初始中心点：中国中心位置坐标
      center: [107.4976, 32.1697],
      
      // 初始缩放级别：4级显示全国视图
      zoom: 4,
      
      // 是否显示路网：true 显示道路网
      showRoad: false,
      
      // 是否显示建筑物：true 显示3D建筑物
      showBuilding: false,
      
      // 是否启用旋转：true 允许用户旋转地图
      rotateEnable: false,
      
      // 是否启用倾斜：true 允许用户倾斜地图视角
      pitchEnable: false
    });

    /************************ 信息窗口参数详解 ************************/
    // 创建信息窗口实例
    infoWin = new AMap.InfoWindow({
      // 点击地图时是否自动关闭信息窗口
      closeWhenClickMap: true,
      
      // 信息窗口位置偏移量（像素）
      
      offset: new AMap.Pixel(0,0),
      
      // 是否自定义窗口内容
      isCustom: true,
      
      // 是否自动移动地图使信息窗口在视野范围内
      autoMove: true,
      
      // 信息窗口边框颜色
      borderColor: '#404048',
      
      // 信息窗口圆角大小
      borderRadius: 6

      
    });

    /************************ 行政区热力图层参数详解 ************************/
    // 创建行政区热力图层
    vLayer = new Loca.DistrictLayer({
      // 是否自动调整地图视图以包含所有数据
      fitView: true,
      
      // 是否支持鼠标事件（点击、悬停等）
      eventSupport: true,
      
      // 是否启用下钻功能（点击进入下级行政区）
      drillDown: true,
      
      // 关联的地图实例
      map: map,
      
      // 图层在Z轴上的层级（控制覆盖关系）
      zIndex: 4,
      
      // 图层透明度（0-1）
      opacity: 0.9,
      
      // 是否启用深度测试（3D效果相关）
      depth: false,
      
      // 是否显示文本标签
      text: false,
      
      // 下钻时的动画持续时间（毫秒）
      drillDownDuration: 30
    });

    /************************ 地图点击事件处理 ************************/
    // 为热力图层添加点击事件监听
    vLayer.on('click', function (ev) {
      // 获取原始的鼠标事件
      const originalEv = ev.originalEvent;
      
      // 将鼠标位置转换为地理坐标
      const lnglat = map.containerToLngLat(new AMap.Pixel(originalEv.clientX, originalEv.clientY));
      
      // 获取点击的地理要素
      const feature = ev.feature;
      
      // 获取该区域的数据值
      const value = ev.value;
      
      // 获取该区域的属性信息
      const property = feature.subFeature.properties;

      // 构建信息窗口内容数据
      infoContentData.value = {
        name: property.name,
        value: value,
        childrenNum: property.childrenNum,
        adcode: property.adcode
      };
      // 计算 InfoWindowContent 组件在页面上的位置（按钮下方或鼠标点）
      const mapRect = document.getElementById('mapContainer').getBoundingClientRect();
      infoContentPos.value = {
        left: originalEv.clientX - mapRect.left,
        top: originalEv.clientY - mapRect.top
      };
      infoContentVisible.value = true;
      // 仍然弹出原生 infoWin 以兼容地图交互
      infoWin.setContent('<div></div>'); // 空内容
      infoWin.open(map, lnglat);
    });

    // 注册全局下钻函数
    window.go2Adcode = (event, code) => {
      // 阻止事件冒泡
      event.stopPropagation();
      
      // 关闭信息窗口
      infoWin.close();
      infoContentVisible.value = false;
      
      // 跳转到指定行政区
      vLayer.goto(code);
    };

    /************************ 加载和渲染热力数据 ************************/
    // 从远程加载CSV格式的热力数据
    window.$.get('//a.amap.com/Loca/static/mock/tourist_attractions.csv', function (data) {
      // 设置图层数据
      vLayer.setData(data, {
        // 数据类型：CSV格式
        type: 'csv',
        
        // 经纬度字段名
        lnglat: '经纬度',
        
        // 数据值字段名
        value: '区域帖子数量'
      });

      // 设置图层样式选项
      vLayer.setOptions({
        // 统计模式：计数模式
        mode: 'count',
        
        // 样式配置
        style: {
          // 颜色梯度（从低到高）
          color: [
            '#0c2c84', // 最低值颜色
            '#225ea8', 
            '#225ea8', 
            '#41b6c4', 
            '#7fcdbb', 
            '#c7e9b4', 
            '#ffffcc'  // 最高值颜色
          ],
          
          // 高度计算函数（根据数据值确定）
          height: (index, feature) => {
            const val = feature.value;
            return val ? val * 5000 : 0;
          },
          
          // 顶部颜色（3D效果）
          topColor: '#ffffcc',
          
          // 底部颜色（3D效果）
          bottomColor: '#0c2c84',
          
          // 边框颜色
          borderColor: '#2a2a32',
          
          // 边框宽度
          borderWidth: 1
        },
        
        // 选中样式（设为false禁用选中效果）
        selectStyle: false
      });

      // 渲染图层到地图
      vLayer.render();
    });

    /************************ 行政区上浮按钮事件 ************************/
    // 绑定行政区上浮按钮点击事件
    document.getElementById('up-btn').addEventListener('click', () => {
      // -1 表示返回到上级行政区
      vLayer.goto(-1);
    });
  });
});

onUnmounted(() => {
  // 组件卸载时清理地图资源
  if (map) {
    map.destroy();  // 销毁地图实例
    map = null;
    vLayer = null;
    infoWin = null;
    // 移除全局函数
    delete window.go2Adcode;
  }
  infoContentVisible.value = false;
});
</script>

<style scoped>
/*  页面容器样式 */
.page-content {
  padding: 40px;
  background-color: #DAE0E6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
/* 图标 样式 */
.chart-container {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
/*  图表标题 */
.chart-header {
  padding: 12px 20px;
  background: #f5f5f5;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
/* 图表容器 */
.charts-wrapper {
  display: flex;
  gap: 20px;
  padding: 0 20px 20px;
  height: 400px;
  transition: height 0.3s ease;
}
/*  图表折叠样式 */
.charts-wrapper.folded {
  height: 0;
  padding: 0 20px;
  overflow: hidden;
}
/* 图表容器内部样式 */
.chart {
  height: 100%;
  width: 33.33%;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
}
/* 地图外层包裹，便于绝对定位 */
.map-container-wrapper {
  position: relative;
}
/* 地图样式 */
.map-container {
  height: 600px;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
</style>

<!--  地图信息框样式 -->
<style>
/*  关闭按钮设置 */
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
/*  关闭按钮鼠标移入设置 */
.amap-info-close:hover {
  color: #f0f2ff;
  background: rgba(255, 255, 255, 0.1);
}
</style>