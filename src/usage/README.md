# 使用示例目录

此目录包含首页功能的各种使用示例和最佳实践。

## 文件说明

### 1. testDataUsage.js
展示如何使用测试数据的示例
- 直接使用测试数据（开发阶段）
- 模拟API调用（使用测试数据）
- 开发环境使用测试数据，生产环境使用真实API
- 完整的测试数据集成方案

### 2. apiUsage.js
展示如何使用API的示例
- 获取用户增长数据
- 获取帖子趋势数据
- 获取举报类型数据
- 一次性获取所有首页数据（推荐方式）
- 完整的API集成代码

### 3. homeVueExample.js
完整的Home.vue示例代码
- 包含所有功能的完整实现
- 开发环境和生产环境的兼容处理
- 数据获取、图表更新、地图初始化的完整流程
- 错误处理和降级方案

### 4. advancedUsage.js
高级使用示例和最佳实践
- 自定义图表配置示例
- 性能优化方案
  - 使用防抖处理频繁更新
  - 虚拟滚动处理大量数据
  - Web Worker 处理复杂计算
  - IntersectionObserver 实现懒加载
  - requestAnimationFrame 优化动画
- 错误处理和降级策略
  - 全局错误处理
  - API 错误处理
  - 图表错误处理
- 数据缓存策略
  - localStorage 缓存
  - IndexedDB 存储
  - Service Worker 缓存
- 组件通信最佳实践
  - provide/inject 深层组件通信
  - 事件总线通信
  - Vuex 状态管理

## 使用建议

### 开发环境
在开发环境中，建议直接使用测试数据，避免依赖后端API：
```javascript
import { userGrowthData, postTrendData, violationTypeData } from '@/data';
```

### 生产环境
在生产环境中，使用API获取数据：
```javascript
import { getUserGrowthData, getPostTrendData, getViolationTypeData } from '@/api/home';
```

### 混合模式（推荐）
根据环境自动切换数据源：
```javascript
const isDevelopment = import.meta.env.DEV;

// 根据环境选择数据源
const fetchData = async () => {
  if (isDevelopment) {
    // 使用测试数据
    return testData;
  } else {
    // 调用API
    return await apiCall();
  }
};
```

## 最佳实践

1. **批量获取数据**：使用 `getHomeDashboardData()` 一次性获取所有数据，减少请求次数
2. **错误处理**：API调用失败时降级到测试数据，确保页面正常显示
3. **加载状态**：使用 `isLoading` 控制加载状态，提升用户体验
4. **资源清理**：组件卸载时清理图表和地图实例，避免内存泄漏
5. **性能优化**：使用防抖、虚拟滚动等技术优化大数据量场景
6. **数据缓存**：合理使用缓存策略，提升应用性能
7. **组件通信**：根据场景选择合适的组件通信方式

## 快速开始

1. 查看 `homeVueExample.js` 获取完整实现
2. 根据需求选择合适的数据获取方式
3. 参考示例代码进行集成
4. 查看 `advancedUsage.js` 了解高级特性和优化方案

## 相关文档

- 测试数据说明：`src/data/README.md`
- API接口文档：`src/api/home.js`
- 组件实现：`src/views/Home.vue` 