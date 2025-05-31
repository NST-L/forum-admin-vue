<template>
  <div class="page-content">
    <h1>用户违规处理</h1>
    <p class="description">在这里你可以查看所有被举报的用户并对违规内容进行处理</p>

    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card total">
        <div class="icon"><i class="fas fa-user-shield"></i></div>
        <div class="number">{{ reports.length }}</div>
        <div class="label">总举报</div>
      </div>
      <div class="stat-card pending">
        <div class="icon"><i class="fas fa-hourglass-half"></i></div>
        <div class="number">{{ reports.filter(r => r.status === 0).length }}</div>
        <div class="label">待处理</div>
      </div>
      <div class="stat-card resolved">
        <div class="icon"><i class="fas fa-check-circle"></i></div>
        <div class="number">{{ reports.filter(r => r.status === 1).length }}</div>
        <div class="label">已处理</div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filters">
      <select>
        <option>处理状态</option>
      </select>
      <select>
        <option>举报原因</option>
      </select>
      <input type="text" placeholder="输入用户昵称或ID..." />
    </div>

    <!-- 举报卡片 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载举报数据...</p>
    </div>
    <div v-else class="report-list">
      <ViolationCard 
        v-for="report in reports" 
        :key="report.id"
        :title="report.username"
        :status="report.status"
        :userId="report.user_id"
        :reporter="report.reporter"
        :reporterId="report.reporter_id"
        :reason="report.reason"
        :date="formatDate(report.ctime)"
        :processor="report.processor"
        :cardClass="getCardClass(report.status)"
      >
        <template #footer>
          <button v-if="report.status === 0" class="action-btn primary">处理举报</button>
          <button v-else class="action-btn gray">查看详情</button>
          <button class="action-btn warn">查看用户</button>
        </template>
      </ViolationCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ViolationCard from '@/components/ViolationCard.vue'
import { getUserViolationList } from '@/api/violation'

const reports = ref([])
const loading = ref(false)

// 获取用户违规举报数据
const fetchReports = async () => {
  loading.value = true
  try {
    const response = await getUserViolationList()
    if (response.data.success) {
      reports.value = response.data.data
    }
  } catch (error) {
    console.error('获取用户违规举报数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化数据
onMounted(() => {
  fetchReports()
})

function getCardClass(status) {
  return status === 0 ? 'card-pending' : 'card-resolved'
}

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.page-content {
  padding: 40px;
  background: #f6f8fb;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  font-size: 24px;
  margin-bottom: 6px;
  color: #222;
}

.description {
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
}

.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  flex: 1;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  text-align: center;
}

.stat-card .icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-card .number {
  font-size: 22px;
  font-weight: bold;
}

.stat-card .label {
  font-size: 13px;
  color: #888;
}

.stat-card.total .icon {
  color: #748ffc;
}

.stat-card.pending .icon {
  color: #f783ac;
}

.stat-card.resolved .icon {
  color: #69db7c;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filters select,
.filters input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  min-width: 160px;
  background-color: #fff;
}

.report-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card-pending {
  border-left: 4px solid #f03e3e;
}

.card-resolved {
  border-left: 4px solid #37b24d;
}

.action-btn {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.action-btn.primary {
  background-color: #4dabf7;
  color: white;
}

.action-btn.warn {
  background-color: #fab005;
  color: #212529;
}

.action-btn.gray {
  background-color: #e9ecef;
  color: #495057;
}

.action-btn:hover {
  opacity: 0.9;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4dabf7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .report-list {
    flex-direction: column;
  }

  .stats-cards,
  .filters {
    flex-direction: column;
  }
}
</style>
