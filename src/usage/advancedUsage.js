// src/usage/advancedUsage.js
// 高级使用示例和最佳实践

// 示例1：自定义图表配置
export const customChartConfig = `
// 自定义用户增长图表配置
const getUserChartOption = (data) => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xAxis,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '用户增长',
      type: 'bar',
      data: data.data,
      itemStyle: {
        color: '#409EFF'
      }
    }]
  };
};

// 自定义帖子趋势图表配置
const getPostChartOption = (data) => {
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['普通帖子', '精华帖子', '置顶帖子']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '普通帖子',
        type: 'line',
        data: data.data[0],
        smooth: true
      },
      {
        name: '精华帖子',
        type: 'line',
        data: data.data[1],
        smooth: true
      },
      {
        name: '置顶帖子',
        type: 'line',
        data: data.data[2],
        smooth: true
      }
    ]
  };
};
`;

// 示例2：性能优化
export const performanceOptimization = `
// 1. 使用防抖处理频繁更新
import { debounce } from 'lodash-es';

const debouncedUpdateChart = debounce((chart, option) => {
  chart.setOption(option);
}, 200);

// 2. 使用虚拟滚动处理大量数据
const virtualScrollConfig = {
  itemSize: 30,
  buffer: 5,
  total: 1000
};

// 3. 使用 Web Worker 处理复杂计算
const worker = new Worker(new URL('@/workers/chartData.worker.js', import.meta.url));

worker.onmessage = (e) => {
  const { type, data } = e.data;
  switch (type) {
    case 'chartData':
      updateChart(data);
      break;
  }
};

// 4. 使用 IntersectionObserver 实现懒加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const chart = entry.target.__chart__;
      if (chart) {
        chart.resize();
      }
    }
  });
});

// 5. 使用 requestAnimationFrame 优化动画
const smoothUpdate = (chart, newData) => {
  requestAnimationFrame(() => {
    chart.setOption({
      series: [{
        data: newData
      }]
    });
  });
};
`;

// 示例3：错误处理和降级策略
export const errorHandling = `
// 1. 全局错误处理
const setupErrorHandling = () => {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise错误:', event.reason);
    // 可以在这里添加错误上报逻辑
  });

  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    // 可以在这里添加错误上报逻辑
  });
};

// 2. API 错误处理
const handleApiError = (error, fallbackData) => {
  if (error.response) {
    // 服务器响应错误
    switch (error.response.status) {
      case 401:
        // 未授权，跳转到登录页
        router.push('/login');
        break;
      case 403:
        // 权限不足
        showError('权限不足');
        break;
      case 404:
        // 资源不存在
        showError('请求的资源不存在');
        break;
      case 500:
        // 服务器错误
        showError('服务器错误，请稍后重试');
        break;
      default:
        showError('请求失败，请稍后重试');
    }
  } else if (error.request) {
    // 请求发送失败
    showError('网络连接失败，请检查网络设置');
  } else {
    // 其他错误
    showError('发生未知错误');
  }

  // 使用降级数据
  return fallbackData;
};

// 3. 图表错误处理
const handleChartError = (chart, error) => {
  console.error('图表错误:', error);
  // 显示错误提示
  chart.setOption({
    graphic: [{
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: '图表加载失败',
        fontSize: 16,
        fill: '#999'
      }
    }]
  });
};
`;

// 示例4：数据缓存策略
export const dataCaching = `
// 1. 使用 localStorage 缓存数据
const cacheData = (key, data, expireTime = 3600000) => {
  const cache = {
    data,
    expire: Date.now() + expireTime
  };
  localStorage.setItem(key, JSON.stringify(cache));
};

const getCachedData = (key) => {
  const cache = localStorage.getItem(key);
  if (!cache) return null;

  const { data, expire } = JSON.parse(cache);
  if (Date.now() > expire) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
};

// 2. 使用 IndexedDB 存储大量数据
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('forumData', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('chartData')) {
        db.createObjectStore('chartData', { keyPath: 'id' });
      }
    };
  });
};

// 3. 使用 Service Worker 缓存 API 响应
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker 注册成功:', registration);
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
    }
  }
};
`;

// 示例5：组件通信最佳实践
export const componentCommunication = `
// 1. 使用 provide/inject 进行深层组件通信
const provideChartData = () => {
  const chartData = ref(null);
  
  provide('chartData', {
    data: chartData,
    update: (newData) => {
      chartData.value = newData;
    }
  });
  
  return chartData;
};

// 2. 使用事件总线进行组件间通信
import mitt from 'mitt';
const emitter = mitt();

// 发送事件
const emitChartUpdate = (data) => {
  emitter.emit('chart-update', data);
};

// 监听事件
const listenChartUpdate = (callback) => {
  emitter.on('chart-update', callback);
};

// 3. 使用 Vuex 进行状态管理
const store = createStore({
  state: {
    chartData: null,
    loading: false,
    error: null
  },
  mutations: {
    setChartData(state, data) {
      state.chartData = data;
    },
    setLoading(state, status) {
      state.loading = status;
    },
    setError(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchChartData({ commit }) {
      commit('setLoading', true);
      try {
        const response = await api.getChartData();
        commit('setChartData', response.data);
      } catch (error) {
        commit('setError', error);
      } finally {
        commit('setLoading', false);
      }
    }
  }
});
`; 