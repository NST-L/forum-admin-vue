<template>
  <div class="post-violation">
    <h1 class="page-title">帖子违规处理</h1>
    <div class="filter-bar-row">
      <div class="radio-inputs">
        <label class="radio">
          <input type="radio" name="status" :checked="selectedStatus === ''" @change="selectedStatus = ''">
          <span class="name">总举报 <span style='font-weight:600;margin-left:4px;'>{{ reports.length }}</span></span>
        </label>
        <label class="radio">
          <input type="radio" name="status" :checked="selectedStatus === '0'" @change="selectedStatus = '0'">
          <span class="name">待处理 <span style='font-weight:600;margin-left:4px;'>{{ pendingCount }}</span></span>
        </label>
        <label class="radio">
          <input type="radio" name="status" :checked="selectedStatus === '1'" @change="selectedStatus = '1'">
          <span class="name">已处理 <span style='font-weight:600;margin-left:4px;'>{{ resolvedCount }}</span></span>
        </label>
        <label class="radio">
          <input type="radio" name="status" :checked="selectedStatus === '2'" @change="selectedStatus = '2'">
          <span class="name">已驳回 <span style='font-weight:600;margin-left:4px;'>{{ rejectedCount }}</span></span>
        </label>
      </div>
      <div class="filters">
        <select v-model="selectedReason">
          <option value="">举报原因</option>
          <option v-for="reason in reasonOptions" :key="reason.code" :value="reason.reason">
            {{ getReasonText(reason.reason) }}
          </option>
        </select>
                    <input v-model="keyword" class="input" placeholder="搜索违规内容、举报人ID" />
      </div>
    </div>

    <!-- 举报卡片列表 -->
    <div v-if="filteredReports.length === 0" class="empty-container">
      <i class="fas fa-info-circle empty-icon"></i>
      <p class="empty-tip">暂无相关举报数据</p>
    </div>
    <div v-else class="report-list">
      <ViolationCard
        v-for="report in filteredReports"
        :key="report.id"
        :reportedContent="report.content"
        :reportedUsername="report.post_author"
        :avatarUrl="report.avatarUrl"
        :reporterId="report.reporterId"
        :reasonText="report.reasonTypeName || getReasonText(report.reasonType)"
        :reportTime="formatDate(report.ctime)"
        :status="report.status"
        :statusText="report.statusName || getStatusText(report.status)"
        :processorId="report.processorId"
        :processResult="report.processResult"
        :processTime="formatProcessTime(report.mtime, report.status)"
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
    <ViolationProcessDialog
      v-model="showDialog"
      :reportData="processDialogData"
      :violationType="'POST'"
      :processing="processing"
      @primary-action="handleBanPost"
      @reject-report="handleRejectReport"
      @cancel="closeDialog"
    />

    <!-- 查看详情弹窗 -->
    <ViolationDetailDialog
      v-model="showDetailDialog"
      :reportData="detailDialogData"
      :violationType="'POST'"
      @close="closeDetailDialog"
    />

    <!-- 回到顶部按钮 -->
    <button v-if="showBackToTopBtn" class="back-to-top-btn" @click="scrollToTop">回到顶部</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import ViolationCard from '@/components/ViolationCard.vue'
import ViolationProcessDialog from '@/components/ViolationProcessDialog.vue'
import ViolationDetailDialog from '@/components/ViolationDetailDialog.vue'
import { getViolationList, handleViolation, getReportReasons, getReasonText } from '@/api/violation'

const reports = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const selectedReason = ref('')
const keyword = ref('')
const showDialog = ref(false)
const currentReport = ref(null)
const processing = ref(false)
const showDetailDialog = ref(false)
const currentDetailReport = ref(null)
const showBackToTopBtn = ref(false)
const reasonOptions = ref([])

// 获取举报原因列表
const fetchReportReasons = async () => {
  try {
    const response = await getReportReasons('POST')
    if (response.data.code === 0) {
      reasonOptions.value = response.data.data || []
    } else {
      ElMessage.error('获取举报原因失败')
    }
  } catch (error) {
    console.error('获取举报原因失败:', error)
    ElMessage.error('获取举报原因失败，请稍后重试')
    reasonOptions.value = []
  }
}

// 获取帖子违规举报数据
const fetchReports = async () => {
  loading.value = true
  try {
    const params = { 
      componentType: 'POST'
    }
    const response = await getViolationList(params)
    
    // 适配新的后端响应格式
    if (response.data.code === 0) {
      const rawList = response.data.data.list || []
      // 字段映射：将后端字段映射为前端期望的字段
      reports.value = rawList.map(item => {
        return {
          id: item.reportId,
          reportId: item.reportId,
          // 被举报帖子信息
          content: item.content || '帖子内容',
          post_author: item.username, // 被举报帖子的作者
          avatarUrl: item.avatarUrl, // 被举报用户的头像
          componentId: item.componentId,
          // 举报人信息
          reporterId: item.reporterId,
          reporter_name: `用户${item.reporterId}`,
          // 举报原因
          reasonType: item.reasonType,
          reasonTypeName: getReasonText(item.reasonType),
          // 状态
          status: mapStatusToNumber(item.status),
          statusName: getStatusText(mapStatusToNumber(item.status)),
          // 处理人信息
          processorId: item.processorId,
          // 处理结果
          processResult: item.processResult,
          // 举报时间
          ctime: new Date(item.ctime).getTime() / 1000,
          // 处理时间
          mtime: new Date(item.mtime).getTime() / 1000,
          
          // 兼容字段
          reason: mapReasonTypeToNumber(item.reasonType)
        }
      })
    } else {
      console.warn('[PostViolation] 接口返回错误:', response.data)
      ElMessage.error(response.data.message || '获取帖子举报数据失败')
    }
  } catch (error) {
    console.error('获取帖子违规举报数据失败:', error)
    ElMessage.error('获取帖子举报数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 将后端reasonType字符串映射为前端期望的数字
const mapReasonTypeToNumber = (reasonType) => {
  const mapping = {
    'POST_AD': 1,
    'POST_FRAUD': 1,
    'POST_PROMOTION': 1,
    'POST_POLITICAL': 3,
    'POST_ILLEGAL': 0,
    'POST_MISINFO': 2,
    'POST_RUMOR_EVENT': 2,
    'POST_PORN': 0,
    'POST_DANGEROUS': 0,
    'POST_VIOLENCE': 2,
    'POST_YOUTH_HARM': 0,
    'POST_PROVOKE': 2,
    'POST_FORMAT_ISSUE': 4,
    'POST_PLAGIARISM': 4,
    'POST_COPYRIGHT': 4,
    'POST_DISCOMFORT': 4,
    'POST_OTHER': 4
  }
  return mapping[reasonType] || 4
}

// 将后端status字符串映射为前端期望的数字
const mapStatusToNumber = (status) => {
  const mapping = {
    'PENDING': 0,
    'RESOLVED': 1,
    'REJECTED': 2
  }
  return mapping[status] || 0
}

// 动态筛选逻辑
const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchStatus = selectedStatus.value === '' || String(report.status) === selectedStatus.value
    const matchReason = selectedReason.value === '' || report.reasonType === selectedReason.value
    const keywordLower = keyword.value.trim().toLowerCase()
    const matchKeyword =
      !keywordLower ||
      report.content?.toLowerCase().includes(keywordLower) ||
      report.componentId?.toString().includes(keywordLower) ||
      report.reporter_name?.toLowerCase().includes(keywordLower) ||
      report.reporterId?.toString().includes(keywordLower)
    return matchStatus && matchReason && matchKeyword
  })
})

const pendingCount = computed(() => reports.value.filter(r => r.status === 0).length)
const resolvedCount = computed(() => reports.value.filter(r => r.status === 1).length)
const rejectedCount = computed(() => reports.value.filter(r => r.status === 2).length)

// 为处理弹窗准备数据
const processDialogData = computed(() => {
  if (!currentReport.value) return null
  return {
    id: currentReport.value.reportId, // 举报业务ID
    componentId: currentReport.value.componentId, // 被举报帖子ID
    content: currentReport.value.content, // 帖子内容
    username: currentReport.value.post_author, // 被举报帖子的作者
    avatarUrl: currentReport.value.avatarUrl, // 被举报用户头像
    reporterId: currentReport.value.reporterId, // 举报人ID
    reporterName: currentReport.value.reporter_name, // 举报人名称
    reasonText: getReasonText(currentReport.value.reasonType) || reasonText(currentReport.value.reason),
    reportTime: formatDate(currentReport.value.ctime)
  }
})

// 为详情弹窗准备数据
const detailDialogData = computed(() => {
  if (!currentDetailReport.value) return null
  return {
    id: currentDetailReport.value.reportId, // 举报业务ID
    componentId: currentDetailReport.value.componentId, // 被举报帖子ID
    content: currentDetailReport.value.content, // 帖子内容
    username: currentDetailReport.value.post_author, // 被举报帖子的作者
    avatarUrl: currentDetailReport.value.avatarUrl, // 被举报用户头像
    reporterId: currentDetailReport.value.reporterId, // 举报人ID
    reporterName: currentDetailReport.value.reporter_name, // 举报人名称
    reasonText: getReasonText(currentDetailReport.value.reasonType) || reasonText(currentDetailReport.value.reason),
    reportTime: formatDate(currentDetailReport.value.ctime),
    statusText: getStatusText(currentDetailReport.value.status),
    processorId: currentDetailReport.value.processorId,
    processResult: currentDetailReport.value.processResult,
    processTime: formatProcessTime(currentDetailReport.value.mtime, currentDetailReport.value.status)
  }
})

onMounted(() => {
  fetchReports()
  fetchReportReasons()
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
}

function closeDialog() {
  showDialog.value = false
  currentReport.value = null
}

async function handleBanPost(processOpinion) {
  if (!currentReport.value || !processOpinion) {
    ElMessage.warning('请填写处理意见')
    return
  }
  processing.value = true
  try {
    // 传递 reportId 而不是被举报内容的ID
    const res = await handleViolation('posts', currentReport.value.reportId, 'ban', processOpinion)
    if (res.data.success) {
      // 本地立即变更
      const idx = reports.value.findIndex(r => r.id === currentReport.value.id)
      if (idx !== -1) reports.value[idx].status = 1
      ElMessage.success('帖子封禁成功！举报已处理')
      setTimeout(() => {
        closeDialog()
        fetchReports() // 异步刷新
      }, 800)
    } else {
      ElMessage.error(res.data.message || '帖子封禁失败')
    }
  } catch (e) {
    ElMessage.error('帖子封禁失败，请稍后重试')
  } finally {
    processing.value = false
  }
}

async function handleRejectReport(processOpinion) {
  if (!currentReport.value || !processOpinion) {
    ElMessage.warning('请填写处理意见')
    return
  }
  processing.value = true
  try {
    // 传递 reportId 而不是被举报内容的ID
    const res = await handleViolation('posts', currentReport.value.reportId, 'reject', processOpinion)
    if (res.data.success) {
      // 本地立即变更
      const idx = reports.value.findIndex(r => r.id === currentReport.value.id)
      if (idx !== -1) reports.value[idx].status = 2
      ElMessage.success('举报驳回成功！')
      setTimeout(() => {
        closeDialog()
        fetchReports() // 异步刷新
      }, 800)
    } else {
      ElMessage.error(res.data.message || '举报驳回失败')
    }
  } catch (e) {
    ElMessage.error('举报驳回失败，请稍后重试')
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

// 监听筛选条件变化
watch([selectedStatus, selectedReason, keyword], () => {
  // 筛选条件变化时的逻辑处理（如果需要的话）
})

// 监听弹窗状态，动态切换body overflow
watch([showDialog, showDetailDialog], ([dialog, detail]) => {
  if (dialog || detail) {
    document.body.style.overflow = 'auto';
  } else {
    document.body.style.overflow = 'hidden';
  }
});

onUnmounted(() => {
  document.body.style.overflow = 'hidden';
});

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

// 获取状态文本
function getStatusText(status) {
  const mapping = {
    0: '待处理',
    1: '已处理',
    2: '已驳回'
  }
  return mapping[status] || '待处理'
}

// 处理时间格式化方法 - 只在已处理状态下显示
function formatProcessTime(timestamp, status) {
  if (!timestamp || status === 0) return null
  return formatDate(timestamp)
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
/* 移除 el-card 默认阴影 */


.post-violation {
  padding: 40px;
  background: #DAE0E6;
  min-height: 100vh;
}
.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 24px;
  margin-top: 0;
  color: #222;
  letter-spacing: 2px;
}

.filter-bar-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.radio-inputs {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  border-radius: 0.5rem;
  background-color: #ffffff;
  box-sizing: border-box;
  padding: 0.25rem;
  width: 300px;
  font-size: 14px;
}

.radio-inputs .radio {
  flex: 1 1 auto;
  text-align: center;
}

.radio-inputs .radio input {
  display: none;
}

.radio-inputs .radio .name {
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  padding: .5rem 0;
  color: rgba(51, 65, 85, 1);
  transition: all .15s ease-in-out;
  background: transparent;
  font-weight: 400;
}

.radio-inputs .radio input:checked + .name {
  background-color: #FF4500;
  color: #fff;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filters select:focus, .filters select:active {
  outline: none;
  border: none;
}

.filters select{
  min-width: 200px;
  max-width: 300px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  color: rgb(0, 0, 0);
}

.report-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .report-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 800px) {
  .report-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 500px) {
  .report-list {
    grid-template-columns: 1fr;
  }
}

.report-list > * {
  box-sizing: border-box;
}



.action-btn {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background-color: #FF4500;
  color: white !important;
  box-shadow: 0 2px 8px rgba(255, 69, 0, 0.3);
}

.action-btn:hover {
  opacity: 0.9;
}

.action-btn.primary:hover {
  background-color: #E63E00;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.action-btn.gray {
  background-color: #e9ecef;
  color: #495057;
}





@media (max-width: 768px) {
  .report-list {
    flex-direction: column;
  }

  .radio-inputs,
  .filters {
    flex-direction: column;
  }
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-inputs, .radio, .filters, .report-list, .action-btn, .empty-tip {
  color: #222 !important;
}

.input {
  max-width: 190px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  outline: none;
  color: dimgray;
}

</style>