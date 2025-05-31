# 测试数据目录

本目录包含所有用于开发环境的测试数据，确保前端在没有后端服务的情况下能够正常运行和调试。

## 文件结构

### 首页相关数据
- `homeData.js` - 首页综合数据
- `userGrowthData.js` - 用户增长趋势数据
- `postTrendData.js` - 帖子数量趋势数据
- `violationTypeData.js` - 举报类型占比数据
- `homeStatsData.js` - 首页统计数据
- `mapHeatData.js` - 地图热力图数据

### 用户管理数据
- `userManagementData.js` - 用户管理页面数据，包含用户列表、活动记录等

### 违规处理数据
- `violationData.js` - 违规处理相关数据，包含：
  - 用户违规举报数据 (userViolationData)
  - 帖子违规举报数据 (postViolationData)
  - 评论违规举报数据 (commentViolationData)

### 索引文件
- `index.js` - 统一导出所有数据
- `usageExample.js` - 使用示例代码

## API 集成说明

所有页面组件已经重构，移除了硬编码的测试数据，改为通过 API 调用获取数据：

### API 文件对应关系
- `src/api/home.js` → 首页数据 API
- `src/api/userManagement.js` → 用户管理 API  
- `src/api/violation.js` → 违规处理 API

### 开发/生产环境切换
所有 API 文件都支持开发/生产环境自动切换：
- **开发环境** (`import.meta.env.DEV = true`): 使用本地测试数据
- **生产环境** (`import.meta.env.DEV = false`): 调用实际后端 API

## 重构完成的页面

### ✅ 已重构页面
1. **Home.vue** - 首页仪表板
   - 用户增长图表
   - 帖子趋势图表
   - 违规类型占比图表
   - 地图热力图

2. **UserManagement.vue** - 用户管理
   - 用户列表展示
   - 用户状态操作
   - 用户详情查看
   - 活动记录导出

3. **UserViolation.vue** - 用户违规处理
   - 用户违规举报列表
   - 举报状态管理

4. **PostViolation.vue** - 帖子违规处理
   - 帖子违规举报列表
   - 举报处理功能

5. **CommentViolation.vue** - 评论违规处理
   - 评论违规举报列表
   - 评论处理功能

### 🎨 用户体验改进
- 添加了加载状态指示器
- 错误处理和用户反馈
- 响应式设计优化
- 数据更新的实时反馈

## 使用方法

```javascript
// 导入特定数据
import { userGrowthData } from '@/data/userGrowthData';
import { userManagementData } from '@/data/userManagementData';

// 导入所有数据
import * as testData from '@/data';

// 通过 API 调用（推荐）
import { getUserList } from '@/api/userManagement';
import { getUserViolationList } from '@/api/violation';
```

## 开发建议

1. **新增页面时**：先在 `data/` 目录创建对应的测试数据文件
2. **API 开发时**：在 `api/` 目录创建对应的 API 文件，支持开发/生产环境切换
3. **数据结构变更时**：同时更新测试数据和 API 接口
4. **组件开发时**：使用 API 调用而不是直接引用测试数据，确保生产环境兼容性

## 注意事项

- 所有测试数据仅用于开发环境，生产环境会自动切换到实际 API
- 修改测试数据不会影响生产环境
- API 接口设计应保持与测试数据结构一致
- 新增数据文件后需要在 `index.js` 中添加导出

## 数据文件说明

### 1. userGrowthData.js
用户增长趋势测试数据
- `month`: 月度数据（2023年1-5月）
- `year`: 年度数据（2019-2023年）

### 2. postTrendData.js
帖子数量趋势测试数据
- `month`: 月度数据，包含技术、生活、娱乐和总帖子数
- `year`: 年度数据，包含技术、生活、娱乐和总帖子数

### 3. violationTypeData.js
举报类型占比测试数据
- `user`: 用户举报类型分布
- `post`: 帖子举报类型分布
- `comment`: 评论举报类型分布

类型包括：违法、广告、攻击、涉政、其他

### 4. mapHeatData.js
地图热力测试数据
- 包含全国主要城市的坐标和帖子数量
- 字段：经纬度、区域帖子数量、name、adcode

### 5. homeStatsData.js
首页统计数据
- 总用户数、今日新增用户
- 总帖子数、今日新增帖子
- 总评论数、今日新增评论
- 总违规数、今日新增违规
- 活跃用户、在线用户
- 浏览量统计等

### 6. homeData.js
综合数据文件，整合所有模块的数据

### 7. index.js
统一导出文件，方便引用所有测试数据

## 数据格式说明

所有数据都是静态的测试数据，用于开发和演示。在实际生产环境中，这些数据应该从后端API获取。

API返回格式参考 `src/api/homeMockData.js` 