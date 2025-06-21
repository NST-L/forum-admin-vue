<template>
  <div class="comment-violation">
    <h1 class="page-title">评论违规处理</h1>
    <div class="filter-bar-row">
      <div class="radio-inputs">
        <label class="radio">
          <input type="radio" name="status" :checked="selectedStatus === ''" @change="selectedStatus = ''">
          <span class="name">总举报 <span style='font-weight:600;margin-left:4px;'>{{ comments.length }}</span></span>
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
    <div v-if="filteredComments.length === 0" class="empty-container">
      <i class="fas fa-info-circle empty-icon"></i>
      <p class="empty-tip">暂无相关举报数据</p>
    </div>
    <div v-else class="report-list">
      <ViolationCard
        v-for="comment in filteredComments"
        :key="comment.reportId"
        :reportedContent="comment.content"
        :reportedContentId="comment.componentId"
        :reportedUsername="comment.username"
        :avatarUrl="comment.avatarUrl"
        :reporterId="comment.reporterId"
        :reasonText="comment.reasonTypeName || getReasonText(comment.reasonType)"
        :reportTime="formatDate(comment.ctime)"
        :status="comment.status"
        :statusText="comment.statusName || getStatusText(comment.status)"
        :processorId="comment.processorId"
        :processResult="comment.processResult"
        :processTime="formatProcessTime(comment.mtime, comment.status)"
        :cardClass="getCardClass(comment.status)"
      >
        <template #default>
          <div class="card-status-tag" :class="statusTagClass(comment.status)">
            {{ statusTagText(comment.status) }}
          </div>
        </template>
        <template #footer>
          <button v-if="comment.status === 0" class="action-btn primary" @click="openDialog(comment)">处理评论</button>
          <button v-else class="action-btn gray" @click="openDetailDialog(comment)">查看详情</button>
        </template>
      </ViolationCard>
    </div>

    <!-- 处理评论弹窗 -->
    <ViolationProcessDialog
      v-model="showDialog"
      :reportData="processDialogData"
      :violationType="'COMMENT'"
      :processing="processing"
      @primary-action="handleBanComment"
      @reject-report="handleRejectReport"
      @cancel="closeDialog"
    />

    <!-- 查看详情弹窗 -->
    <ViolationDetailDialog
      v-model="showDetailDialog"
      :reportData="detailDialogData"
      :violationType="'COMMENT'"
      @close="closeDetailDialog"
    />

    <button
      v-if="showBackToTop"
      class="back-to-top-btn"
      @click="scrollToTop"
    >
      回到顶部
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ViolationCard from '@/components/ViolationCard.vue'
import ViolationProcessDialog from '@/components/ViolationProcessDialog.vue'
import ViolationDetailDialog from '@/components/ViolationDetailDialog.vue'
import { getViolationList, handleViolation, getReportReasons, getReasonText } from '@/api/violation'

const comments = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const selectedReason = ref('')
const keyword = ref('')
const showDialog = ref(false)
const currentComment = ref(null)
const processing = ref(false)
const showDetailDialog = ref(false)
const currentDetailComment = ref(null)
const showBackToTop = ref(false)
const reasonOptions = ref([])

// 获取举报原因列表
const fetchReportReasons = async () => {
  try {
    const response = await getReportReasons('COMMENT')
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

// 获取评论违规举报数据
const fetchComments = async () => {
  loading.value = true
  try {
    const params = { 
      componentType: 'COMMENT'
    }
    const response = await getViolationList(params)
    
    // 适配新的后端响应格式
    if (response.data.code === 0) {
      const rawList = response.data.data.list || []
      // 字段映射：将后端字段映射为前端期望的字段
      comments.value = rawList.map(item => {
        return {
          id: item.reportId,
          reportId: item.reportId,
          // 被举报内容
          content: item.content || '评论内容',
          componentId: item.componentId,
          // 被举报用户名（评论作者）
          username: item.username,
          avatarUrl: item.avatarUrl, // 被举报用户的头像
          // 举报人ID
          reporterId: item.reporterId,
          // 举报原因
          reasonType: item.reasonType,
          reasonTypeName: getReasonText(item.reasonType),
          // 状态
          status: mapStatusToNumber(item.status),
          statusName: getStatusText(item.status),
          // 处理人ID
          processorId: item.processorId,
          // 处理结果
          processResult: item.processResult,
          // 举报时间
          ctime: new Date(item.ctime).getTime() / 1000,
          // 处理时间
          mtime: new Date(item.mtime).getTime() / 1000,
          
          // 兼容字段
          reporter: `用户${item.reporterId}`,
          reason: mapReasonTypeToNumber(item.reasonType)
        }
      })
    } else {
      console.warn('[CommentViolation] 接口返回错误:', response.data)
      ElMessage.error(response.data.message || '获取评论举报数据失败')
    }
  } catch (error) {
    console.error('获取评论违规举报数据失败:', error)
    ElMessage.error('获取评论举报数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 将后端reasonType字符串映射为前端期望的数字
const mapReasonTypeToNumber = (reasonType) => {
  const mapping = {
    'COMMENT_AD': 1,
    'COMMENT_FRAUD': 1,
    'COMMENT_POLITICAL': 3,
    'COMMENT_ILLEGAL': 0,
    'COMMENT_MISINFO': 2,
    'COMMENT_ATTACK': 2,
    'COMMENT_VERBAL_ABUSE': 2,
    'COMMENT_HARASSMENT': 2,
    'COMMENT_IMPERSONATE': 0,
    'COMMENT_SPAM': 1,
    'COMMENT_OFF_TOPIC': 4,
    'COMMENT_YOUTH_HARM': 0,
    'COMMENT_OTHER': 4
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

// 使用API模块中的getReasonText函数

// 处理时间格式化方法 - 只在已处理状态下显示
const formatProcessTime = (timestamp, status) => {
  if (!timestamp || status === 0) return null
  return formatDate(timestamp)
}

// 获取状态文本 - 根据后端ReportVO的转换逻辑
const getStatusText = (status) => {
  // 后端已经将status转换为英文字符串，这里再转换为中文
  const mapping = {
    'PENDING': '待处理',
    'RESOLVED': '已处理', 
    'REJECTED': '已驳回'
  }
  // 如果是数字，先转换为对应的英文字符串
  if (typeof status === 'number') {
    const numberToStatus = {
      0: 'PENDING',
      1: 'RESOLVED',
      2: 'REJECTED'
    }
    status = numberToStatus[status] || 'PENDING'
  }
  return mapping[status] || '待处理'
}

// 动态筛选逻辑
const filteredComments = computed(() => {
  return comments.value.filter(comment => {
    const matchStatus = selectedStatus.value === '' || String(comment.status) === selectedStatus.value
    const matchReason = selectedReason.value === '' || comment.reasonType === selectedReason.value
    const keywordLower = keyword.value.trim().toLowerCase()
    const matchKeyword =
      !keywordLower ||
      comment.content?.toLowerCase().includes(keywordLower) ||
      comment.componentId?.toString().includes(keywordLower) ||
      comment.reporter?.toLowerCase().includes(keywordLower) ||
      comment.reporterId?.toString().includes(keywordLower)
    return matchStatus && matchReason && matchKeyword
  })
})

const pendingCount = computed(() => comments.value.filter(c => c.status === 0).length)
const resolvedCount = computed(() => comments.value.filter(c => c.status === 1).length)
const rejectedCount = computed(() => comments.value.filter(c => c.status === 2).length)

// 为处理弹窗准备数据
const processDialogData = computed(() => {
  if (!currentComment.value) return null
  return {
    id: currentComment.value.reportId, // 举报业务ID
    componentId: currentComment.value.componentId, // 被举报评论ID
    content: currentComment.value.content,
    username: currentComment.value.username, // 被举报评论的作者
    avatarUrl: currentComment.value.avatarUrl, // 被举报用户头像
    reporterId: currentComment.value.reporterId, // 举报人ID
    reporterName: currentComment.value.reporter, // 举报人名称
    reasonText: getReasonText(currentComment.value.reasonType) || reasonText(currentComment.value.reason),
    reportTime: formatDate(currentComment.value.ctime)
  }
})

// 为详情弹窗准备数据
const detailDialogData = computed(() => {
  if (!currentDetailComment.value) return null
  return {
    id: currentDetailComment.value.reportId, // 举报业务ID
    componentId: currentDetailComment.value.componentId, // 被举报评论ID
    content: currentDetailComment.value.content,
    username: currentDetailComment.value.username, // 被举报评论的作者
    avatarUrl: currentDetailComment.value.avatarUrl, // 被举报用户头像
    reporterId: currentDetailComment.value.reporterId, // 举报人ID
    reporterName: currentDetailComment.value.reporter, // 举报人名称
    reasonText: getReasonText(currentDetailComment.value.reasonType) || reasonText(currentDetailComment.value.reason),
    reportTime: formatDate(currentDetailComment.value.ctime),
    statusText: getStatusText(currentDetailComment.value.status),
    processorId: currentDetailComment.value.processorId,
    processResult: currentDetailComment.value.processResult,
    processTime: formatProcessTime(currentDetailComment.value.mtime, currentDetailComment.value.status)
  }
})

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

onMounted(() => {
  fetchComments()
  fetchReportReasons()
  const mainContent = document.querySelector('.main-content')
  if (mainContent) {
    mainContent.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const mainContent = document.querySelector('.main-content')
  if (mainContent) {
    mainContent.removeEventListener('scroll', handleScroll)
  }
  document.body.style.overflow = 'hidden';
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

function openDialog(comment) {
  currentComment.value = comment
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  currentComment.value = null
}

async function handleBanComment(processOpinion) {
  if (!currentComment.value || !processOpinion) {
    ElMessage.warning('请填写处理意见')
    return
  }
  processing.value = true
  try {
    // 传递 reportId 而不是被举报内容的ID
    const res = await handleViolation('comments', currentComment.value.reportId, 'ban', processOpinion)
    if (res.data.success) {
      // 本地立即变更
      const idx = comments.value.findIndex(c => c.id === currentComment.value.id)
      if (idx !== -1) comments.value[idx].status = 1
      ElMessage.success('评论封禁成功！举报已处理')
      setTimeout(() => {
        closeDialog()
        fetchComments() // 异步刷新
      }, 800)
    } else {
      ElMessage.error(res.data.message || '评论封禁失败')
    }
  } catch (e) {
    ElMessage.error('评论封禁失败，请稍后重试')
  } finally {
    processing.value = false
  }
}

async function handleRejectReport(processOpinion) {
  if (!currentComment.value || !processOpinion) {
    ElMessage.warning('请填写处理意见')
    return
  }
  processing.value = true
  try {
    // 传递 reportId 而不是被举报内容的ID
    const res = await handleViolation('comments', currentComment.value.reportId, 'reject', processOpinion)
    if (res.data.success) {
      // 本地立即变更
      const idx = comments.value.findIndex(c => c.id === currentComment.value.id)
      if (idx !== -1) comments.value[idx].status = 2
      ElMessage.success('举报驳回成功！')
      setTimeout(() => {
        closeDialog()
        fetchComments() // 异步刷新
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

function openDetailDialog(comment) {
  currentDetailComment.value = comment
  showDetailDialog.value = true
}

function closeDetailDialog() {
  showDetailDialog.value = false
  currentDetailComment.value = null
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

function handleScroll() {
  const mainContent = document.querySelector('.main-content')
  if (mainContent) {
    showBackToTop.value = mainContent.scrollTop > mainContent.clientHeight
  }
}

function scrollToTop() {
  const mainContent = document.querySelector('.main-content')
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

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
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* 移除 el-card 默认阴影 */




.comment-violation {
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