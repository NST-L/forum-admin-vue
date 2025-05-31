# Cursor Rules for Forum Administrator System

## 1. 项目结构规范

### 1.1 目录结构
```
src/
├── components/          # 可复用组件
├── views/              # 页面组件
├── router/             # 路由配置
├── assets/             # 静态资源
└── utils/              # 工具函数
```

### 1.2 文件命名
- 组件文件：PascalCase（如 `Sidebar.vue`）
- 工具文件：camelCase（如 `request.js`）
- 样式文件：kebab-case（如 `main-style.css`）

## 2. 代码规范

### 2.1 Vue 组件规范
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup>
// 导入语句
import { ref, onMounted } from 'vue'

// 响应式数据
const data = ref(null)

// 方法定义
const method = () => {}

// 生命周期钩子
onMounted(() => {})
</script>

<style scoped>
/* 组件样式 */
</style>
```

### 2.2 命名规范
- 变量：camelCase
- 常量：UPPER_SNAKE_CASE
- 组件：PascalCase
- 方法：camelCase
- CSS 类名：kebab-case

## 3. 性能优化规则

### 3.1 组件优化
```javascript
// 1. 使用 ref 而不是 reactive 处理简单数据
const count = ref(0)

// 2. 使用 computed 缓存计算结果
const doubleCount = computed(() => count.value * 2)

// 3. 使用 watchEffect 处理副作用
watchEffect(() => {
  console.log(count.value)
})
```

### 3.2 资源加载优化
```javascript
// 1. 异步加载脚本
const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script')
  script.src = src
  script.onload = resolve
  script.onerror = reject
  document.head.appendChild(script)
})

// 2. 并行加载资源
await Promise.all([
  loadScript('script1.js'),
  loadScript('script2.js')
])
```

### 3.3 事件处理优化
```javascript
// 1. 使用具名函数便于解绑
const handler = () => {}
element.addEventListener('click', handler)
element.removeEventListener('click', handler)

// 2. 防抖处理
const debouncedHandler = debounce(handler, 300)
```

## 4. 样式规范

### 4.1 布局规则
```css
/* 1. 使用 flex 布局 */
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 2. 响应式设计 */
@media (max-width: 768px) {
  .container {
    flex-direction: row;
  }
}
```

### 4.2 动画优化
```css
/* 1. 使用 transform 代替位置属性 */
.element {
  transform: translateZ(0);
  will-change: transform;
  transition: transform 0.3s ease;
}

/* 2. 硬件加速 */
.accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

## 5. 地图功能规范

### 5.1 地图初始化
```javascript
// 1. 地图配置
const mapConfig = {
  mapStyle: 'amap://styles/whitesmoke',
  viewMode: '2D',
  features: ['bg'],
  center: [107.4976, 32.1697],
  zoom: 4
}

// 2. 图层配置
const layerConfig = {
  fitView: true,
  eventSupport: true,
  drillDown: true,
  zIndex: 4,
  opacity: 0.9
}
```

### 5.2 事件处理
```javascript
// 1. 事件绑定
const clickHandler = (ev) => {
  // 处理逻辑
}
vLayer.on('click', clickHandler)

// 2. 事件解绑
vLayer.off('click', clickHandler)
```

## 6. 错误处理规范

### 6.1 异步操作错误处理
```javascript
try {
  await asyncOperation()
} catch (error) {
  console.error('操作失败:', error)
} finally {
  // 清理操作
}
```

### 6.2 组件错误处理
```javascript
onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err)
  return false // 阻止错误继续传播
})
```

## 7. 资源清理规范

### 7.1 组件卸载清理
```javascript
onUnmounted(() => {
  // 1. 清理事件监听
  element.removeEventListener('click', handler)
  
  // 2. 清理定时器
  clearInterval(timer)
  
  // 3. 清理地图实例
  map.destroy()
  
  // 4. 清理图表实例
  chart.dispose()
})
```

### 7.2 内存管理
```javascript
// 1. 及时释放大对象
largeObject = null

// 2. 清理闭包引用
const cleanup = () => {
  // 清理逻辑
}
```

## 8. 开发工具配置

### 8.1 ESLint 配置
```json
{
  "extends": [
    "plugin:vue/vue3-recommended",
    "eslint:recommended"
  ],
  "rules": {
    "vue/multi-word-component-names": "error",
    "vue/no-unused-components": "error"
  }
}
```

### 8.2 Vite 配置
```javascript
export default {
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router']
        }
      }
    }
  }
}
```

## 9. 最佳实践

### 9.1 组件设计原则
- 单一职责原则
- 可复用性
- 可维护性
- 性能优化

### 9.2 代码质量保证
- 代码审查
- 单元测试
- 性能测试
- 错误监控

### 9.3 文档维护
- 及时更新文档
- 添加必要的注释
- 保持文档的准确性
- 记录重要的决策和变更

## 10. 版本控制规范

### 10.1 Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 10.2 分支管理
- main: 主分支
- develop: 开发分支
- feature/*: 功能分支
- hotfix/*: 紧急修复分支

## 11. 部署规范

### 11.1 环境配置
- 开发环境
- 测试环境
- 生产环境

### 11.2 构建流程
- 代码检查
- 单元测试
- 构建打包
- 部署验证

## 12. 安全规范

### 12.1 数据安全
- 敏感数据加密
- 数据备份
- 访问控制

### 12.2 代码安全
- 依赖包安全
- 代码审计
- 漏洞修复

## 13. 监控规范

### 13.1 性能监控
- 页面加载时间
- API 响应时间
- 资源加载时间

### 13.2 错误监控
- 前端错误
- API 错误
- 资源加载错误

## 14. 更新日志

### 14.1 版本记录
- 版本号
- 更新内容
- 更新日期
- 负责人

### 14.2 变更记录
- 功能变更
- 性能优化
- Bug 修复
- 文档更新 