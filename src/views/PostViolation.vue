<template>
  <div class="page-content">
    <h1>帖子违规处理</h1>
    <p class="description">在这里你可以查看所有被举报的帖子并对违规内容进行处理</p>

    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card total" :class="{ 'active-card': selectedStatus === '' }" @click="selectedStatus = ''">
        <div class="icon"><i class="fas fa-list"></i></div>
        <div class="number">{{ reports.length }}</div>
        <div class="label">总举报</div>
      </div>
      <div class="stat-card pending" :class="{ 'active-card': selectedStatus === '0' }" @click="selectedStatus = '0'">
        <div class="icon"><i class="fas fa-hourglass-half"></i></div>
        <div class="number">{{ pendingCount }}</div>
        <div class="label">待处理</div>
      </div>
      <div class="stat-card resolved" :class="{ 'active-card': selectedStatus === '1' }" @click="selectedStatus = '1'">
        <div class="icon"><i class="fas fa-check-circle"></i></div>
        <div class="number">{{ resolvedCount }}</div>
        <div class="label">已处理</div>
      </div>
      <div class="stat-card rejected" :class="{ 'active-card': selectedStatus === '2' }" @click="selectedStatus = '2'">
        <div class="icon"><i class="fas fa-times-circle"></i></div>
        <div class="number">{{ rejectedCount }}</div>
        <div class="label">已驳回</div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filters">
      <select v-model="selectedReason">
        <option value="">举报原因</option>
        <option value="0">违法</option>
        <option value="1">广告</option>
        <option value="2">攻击</option>
        <option value="3">涉政</option>
        <option value="4">其他</option>
      </select>
      <input v-model="keyword" type="text" placeholder="输入帖子标题或ID..." />
    </div>

    <!-- 举报卡片列表 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-tip">正在加载数据，请稍候…</p>
    </div>
    <div v-else-if="filteredReports.length === 0" class="empty-container">
      <i class="fas fa-info-circle empty-icon"></i>
      <p class="empty-tip">暂无相关举报数据</p>
    </div>
    <div v-else class="report-list">
      <ViolationCard
        v-for="report in filteredReports"
        :key="report.id"
        :title="report.post_title"
        :userId="String(report.user_id)"
        :reporter="report.reporter_name"
        :reporterId="String(report.reporter_id)"
        :reason="reasonText(report.reason)"
        :date="formatDate(report.ctime)"
        :status="report.status"
        :processor="report.processor_name"
        :cardClass="getCardClass(report.status)"
      >
        <template #default>
          <div class="card-status-tag" :class="statusTagClass(report.status)">
            {{ statusTagText(report.status) }}
          </div>
        </template>
        <template #footer>
          <button v-if="report.status === 0" class="action-btn primary" @click="openDialog(report)">处理帖子</button>
          <button v-else class="action-btn gray" @click="openDetailDialog(report)">查看详情</button>
        </template>
      </ViolationCard>
    </div>

    <!-- 处理帖子弹窗 -->
    <div v-if="showDialog" class="custom-dialog-mask">
      <div class="custom-dialog">
        <div class="custom-dialog-header">处理举报帖子</div>
        <div class="custom-dialog-body" v-if="currentReport">
          <h3>帖子信息</h3>
          <p><b>标题：</b>{{ currentReport.post_title }}</p>
          <p><b>ID：</b>{{ currentReport.post_id }}</p>
          <h3>举报信息</h3>
          <p><b>举报人：</b>{{ currentReport.reporter_name }} (ID: {{ currentReport.reporter_id }})</p>
          <p><b>举报原因：</b>{{ reasonText(currentReport.reason) }}</p>
          <p><b>举报时间：</b>{{ formatDate(currentReport.ctime) }}</p>
          <div style="margin-top: 20px; display: flex; gap: 12px;">
            <button class="action-btn primary" @click="handleBanPost" :disabled="processing">封禁帖子</button>
            <button class="action-btn gray" @click="handleRejectReport" :disabled="processing">驳回举报</button>
            <button class="action-btn" @click="closeDialog" :disabled="processing">取消</button>
          </div>
          <div v-if="processMsg" style="color: #4dabf7; margin-top: 10px;">{{ processMsg }}</div>
        </div>
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <div v-if="showDetailDialog" class="custom-dialog-mask">
      <div class="custom-dialog">
        <div class="custom-dialog-header">处理详情</div>
        <div class="custom-dialog-body" v-if="currentDetailReport">
          <h3>帖子信息</h3>
          <p><b>标题：</b>{{ currentDetailReport.post_title }}</p>
          <p><b>ID：</b>{{ currentDetailReport.post_id }}</p>
          <h3>举报信息</h3>
          <p><b>举报人：</b>{{ currentDetailReport.reporter_name }}</p>
          <p><b>举报原因：</b>{{ reasonText(currentDetailReport.reason) }}</p>
          <p><b>举报时间：</b>{{ formatDate(currentDetailReport.ctime) }}</p>
          <h3>处理信息</h3>
          <p><b>处理方式：</b>{{ handleTypeText(currentDetailReport.status) }}</p>
          <p><b>处理人：</b>{{ currentDetailReport.processor_name || '无' }}</p>
          <p><b>处理意见：</b>{{ currentDetailReport.process_reason || '无' }}</p>
          <div style="margin-top: 20px; text-align: right;">
            <button class="action-btn" @click="closeDetailDialog">关闭</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <button v-if="showBackToTopBtn" class="back-to-top-btn" @click="scrollToTop">回到顶部</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ViolationCard from '@/components/ViolationCard.vue'
import { getPostViolationList, handleViolation } from '@/api/violation'
import { reasonText } from '@/utils/reason'

const reports = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const selectedReason = ref('')
const keyword = ref('')
const showDialog = ref(false)
const currentReport = ref(null)
const processing = ref(false)
const processMsg = ref('')
const showDetailDialog = ref(false)
const currentDetailReport = ref(null)
const showBackToTopBtn = ref(false)

// 获取帖子违规举报数据
const fetchReports = async () => {
  loading.value = true
  try {
    const response = await getPostViolationList()
    if (response.data.success) {
      reports.value = response.data.data
    }
  } catch (error) {
    console.error('获取帖子违规举报数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 动态筛选逻辑
const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchStatus = selectedStatus.value === '' || String(report.status) === selectedStatus.value
    const matchReason = selectedReason.value === '' || String(report.reason) === selectedReason.value
    const keywordLower = keyword.value.trim().toLowerCase()
    const matchKeyword =
      !keywordLower ||
      report.post_title?.toLowerCase().includes(keywordLower) ||
      report.post_id?.toString().includes(keywordLower) ||
      report.reporter_name?.toLowerCase().includes(keywordLower) ||
      report.reporter_id?.toString().includes(keywordLower)
    return matchStatus && matchReason && matchKeyword
  })
})

const pendingCount = computed(() => reports.value.filter(r => r.status === 0).length)
const resolvedCount = computed(() => reports.value.filter(r => r.status === 1).length)
const rejectedCount = computed(() => reports.value.filter(r => r.status === 2).length)

onMounted(() => {
  fetchReports()
  window.addEventListener('scroll', () => {
    showBackToTopBtn.value = window.scrollY > 100
  })
})

// 根据状态返回卡片样式类
function getCardClass(status) {
  status = Number(status)
  if (status === 0) return 'card-pending'
  if (status === 1) return 'card-resolved'
  if (status === 2) return 'card-rejected'
  return ''
}

// 时间格式化方法
function formatDate(timestamp) {
  if (!timestamp) return '--'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function openDialog(report) {
  currentReport.value = report
  showDialog.value = true
  processMsg.value = ''
}

function closeDialog() {
  showDialog.value = false
  currentReport.value = null
  processMsg.value = ''
}

async function handleBanPost() {
  if (!currentReport.value) return
  processing.value = true
  processMsg.value = ''
  try {
    const res = await handleViolation('posts', currentReport.value.id, 'ban')
    if (res.data.success) {
      // 本地立即变更
      const idx = reports.value.findIndex(r => r.id === currentReport.value.id)
      if (idx !== -1) reports.value[idx].status = 1
      processMsg.value = '帖子已封禁，举报处理完成！'
      setTimeout(() => {
        closeDialog()
        fetchReports() // 异步刷新
      }, 800)
    } else {
      processMsg.value = res.data.message || '操作失败'
    }
  } catch (e) {
    processMsg.value = '操作失败'
  } finally {
    processing.value = false
  }
}

async function handleRejectReport() {
  if (!currentReport.value) return
  processing.value = true
  processMsg.value = ''
  try {
    const res = await handleViolation('posts', currentReport.value.id, 'reject')
    if (res.data.success) {
      // 本地立即变更
      const idx = reports.value.findIndex(r => r.id === currentReport.value.id)
      if (idx !== -1) reports.value[idx].status = 2
      processMsg.value = '举报已驳回！'
      setTimeout(() => {
        closeDialog()
        fetchReports() // 异步刷新
      }, 800)
    } else {
      processMsg.value = res.data.message || '操作失败'
    }
  } catch (e) {
    processMsg.value = '操作失败'
  } finally {
    processing.value = false
  }
}

function openDetailDialog(report) {
  currentDetailReport.value = report
  showDetailDialog.value = true
}

function closeDetailDialog() {
  showDetailDialog.value = false
  currentDetailReport.value = null
}

function handleTypeText(status) {
  if (status === 1) return '封禁帖子'
  if (status === 2) return '驳回举报'
  return '待处理'
}

function statusTagText(status) {
  status = Number(status)
  if (status === 0) return '待处理'
  if (status === 1) return '已处理'
  if (status === 2) return '已驳回'
  return ''
}

function statusTagClass(status) {
  status = Number(status)
  if (status === 0) return 'tag-pending'
  if (status === 1) return 'tag-resolved'
  if (status === 2) return 'tag-rejected'
  return ''
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  cursor: pointer;
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

.stat-card.rejected .icon {
  color: #ff6b6b;
}

.active-card {
  outline: 2px solid #4dabf7;
  box-shadow: 0 0 8px rgba(77, 171, 247, 0.4);
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

.report-list > * {
  flex: 1 1 320px;
  max-width: 400px;
  min-width: 280px;
  box-sizing: border-box;
}

.card-pending {
  border-left: 4px solid #f03e3e;
}

.card-resolved {
  border-left: 4px solid #37b24d;
}

.card-rejected {
  border-left: 4px solid #ff6b6b;
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
  margin-bottom: 16px;
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

.custom-dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-dialog {
  background: #fff;
  border-radius: 10px;
  min-width: 340px;
  max-width: 90vw;
  padding: 24px 28px 18px 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  position: relative;
}
.custom-dialog-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}
.custom-dialog-body p {
  margin: 6px 0;
}

.card-status-tag {
  position: absolute;
  top: 14px;
  right: 18px;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  z-index: 2;
}
.tag-pending {
  background: #f03e3e;
}
.tag-resolved {
  background: #37b24d;
}
.tag-rejected {
  background: #fab005;
}
.card-rejected {
  border-left: 4px solid #fab005;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #666;
  margin-bottom: 16px;
}

.empty-tip {
  font-size: 14px;
  color: #666;
}

.back-to-top-btn {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 40px;
  z-index: 9999;
  background: #4dabf7;
  color: #fff;
  border: none;
  border-radius: 8px;
  width: 80px;
  height: 40px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}
.back-to-top-btn:hover {
  background: #339af0;
}
</style>