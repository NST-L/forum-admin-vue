<template>
  <div class="page-content ">
    <h1>用户违规处理</h1>
    <div class="filter-bar-row">
      <div class="radio-inputs">
        <label class="radio">
          <input type="radio" name="status" :checked="selectedStatus === ''" @change="selectedStatus = ''">
          <span class="name">总举报 <span style='font-weight:600;margin-left:4px;'>{{ users.length }}</span></span>
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
          <option value="0">违法</option>
          <option value="1">广告</option>
          <option value="2">攻击</option>
          <option value="3">涉政</option>
          <option value="4">其他</option>
        </select>
        <input v-model="keyword" class="input" placeholder="输入用户昵称或ID..." />
      </div>
    </div>

    <!-- 举报卡片列表 -->
    <div v-if="loading" class="loading-container">
      <span class="loader"></span>
      <p class="loading-tip">正在加载数据，请稍候…</p>
    </div>
    <div v-else-if="filteredUsers.length === 0" class="empty-container">
      <i class="fas fa-info-circle empty-icon"></i>
      <p class="empty-tip">暂无相关举报数据</p>
    </div>
    <div v-else class="report-list">
      <ViolationCard
        v-for="user in filteredUsers"
        :key="user.id"
        :title="user.username"
        :userId="String(user.user_id)"
        :reporter="user.reporter"
        :reporterId="String(user.reporter_id)"
        :reason="reasonText(user.reason)"
        :date="formatDate(user.ctime)"
        :status="user.status"
        :processor="user.processor"
        :cardClass="getCardClass(user.status)"
      >
        <template #default>
          <div class="card-status-tag" :class="statusTagClass(user.status)">
            {{ statusTagText(user.status) }}
          </div>
        </template>
        <template #footer>
          <button v-if="user.status === 0" class="action-btn primary" @click="openDialog(user)">处理用户</button>
          <button v-else class="action-btn gray" @click="openDetailDialog(user)">查看详情</button>
        </template>
      </ViolationCard>
    </div>

    <!-- 处理用户弹窗 -->
    <div v-if="showDialog" class="custom-dialog-mask">
      <div class="custom-dialog">
        <div class="custom-dialog-header">处理举报用户</div>
        <div class="custom-dialog-body" v-if="currentUser">
          <h3>用户信息</h3>
          <p><b>昵称：</b>{{ currentUser.username }}</p>
          <p><b>ID：</b>{{ currentUser.user_id }}</p>
          <h3>举报信息</h3>
          <p><b>举报人：</b>{{ currentUser.reporter }} (ID: {{ currentUser.reporter_id }})</p>
          <p><b>举报原因：</b>{{ reasonText(currentUser.reason) }}</p>
          <p><b>举报时间：</b>{{ formatDate(currentUser.ctime) }}</p>
          <div style="margin-top: 20px; display: flex; gap: 12px;">
            <button class="action-btn primary" @click="handleBanUser" :disabled="processing">封禁用户</button>
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
        <div class="custom-dialog-body" v-if="currentDetailUser">
          <h3>用户信息</h3>
          <p><b>昵称：</b>{{ currentDetailUser.username }}</p>
          <p><b>ID：</b>{{ currentDetailUser.user_id }}</p>
          <h3>举报信息</h3>
          <p><b>举报人：</b>{{ currentDetailUser.reporter }}</p>
          <p><b>举报原因：</b>{{ reasonText(currentDetailUser.reason) }}</p>
          <p><b>举报时间：</b>{{ formatDate(currentDetailUser.ctime) }}</p>
          <h3>处理信息</h3>
          <p><b>处理方式：</b>{{ handleTypeText(currentDetailUser.status) }}</p>
          <p><b>处理人：</b>{{ currentDetailUser.processor || '无' }}</p>
          <p><b>处理意见：</b>{{ currentDetailUser.process_reason || '无' }}</p>
          <div style="margin-top: 20px; text-align: right;">
            <button class="action-btn" @click="closeDetailDialog">关闭</button>
          </div>
        </div>
      </div>
    </div>

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
import ViolationCard from '@/components/ViolationCard.vue'
import { getUserViolationList, handleViolation } from '@/api/violation'

const users = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const selectedReason = ref('')
const keyword = ref('')
const showDialog = ref(false)
const currentUser = ref(null)
const processing = ref(false)
const processMsg = ref('')
const showDetailDialog = ref(false)
const currentDetailUser = ref(null)
const showBackToTop = ref(false)

// 获取用户违规举报数据
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await getUserViolationList()
    if (response.data.success) {
      users.value = response.data.data
    }
  } catch (error) {
    console.error('获取用户违规举报数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 动态筛选逻辑
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchStatus = selectedStatus.value === '' || String(user.status) === selectedStatus.value
    const matchReason = selectedReason.value === '' || String(user.reason) === selectedReason.value
    const keywordLower = keyword.value.trim().toLowerCase()
    const matchKeyword =
      !keywordLower ||
      user.username?.toLowerCase().includes(keywordLower) ||
      user.user_id?.toString().includes(keywordLower) ||
      user.reporter?.toLowerCase().includes(keywordLower) ||
      user.reporter_id?.toString().includes(keywordLower)
    return matchStatus && matchReason && matchKeyword
  })
})

const pendingCount = computed(() => users.value.filter(u => u.status === 0).length)
const resolvedCount = computed(() => users.value.filter(u => u.status === 1).length)
const rejectedCount = computed(() => users.value.filter(u => u.status === 2).length)

// 监听弹窗状态，动态切换body overflow
watch([showDialog, showDetailDialog], ([dialog, detail]) => {
  if (dialog || detail) {
    document.body.style.overflow = 'auto';
  } else {
    document.body.style.overflow = 'hidden';
  }
});

onMounted(() => {
  fetchUsers()
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

function openDialog(user) {
  currentUser.value = user
  showDialog.value = true
  processMsg.value = ''
}

function closeDialog() {
  showDialog.value = false
  currentUser.value = null
  processMsg.value = ''
}

async function handleBanUser() {
  if (!currentUser.value) return
  processing.value = true
  processMsg.value = ''
  try {
    const res = await handleViolation('users', currentUser.value.id, 'ban')
    if (res.data.success) {
      // 本地立即变更
      const idx = users.value.findIndex(u => u.id === currentUser.value.id)
      if (idx !== -1) users.value[idx].status = 1
      processMsg.value = '用户已封禁，举报处理完成！'
      setTimeout(() => {
        closeDialog()
        fetchUsers() // 异步刷新
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
  if (!currentUser.value) return
  processing.value = true
  processMsg.value = ''
  try {
    const res = await handleViolation('users', currentUser.value.id, 'reject')
    if (res.data.success) {
      // 本地立即变更
      const idx = users.value.findIndex(u => u.id === currentUser.value.id)
      if (idx !== -1) users.value[idx].status = 2
      processMsg.value = '举报已驳回！'
      setTimeout(() => {
        closeDialog()
        fetchUsers() // 异步刷新
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

function openDetailDialog(user) {
  currentDetailUser.value = user
  showDetailDialog.value = true
}

function closeDetailDialog() {
  showDetailDialog.value = false
  currentDetailUser.value = null
}

function handleTypeText(status) {
  if (status === 1) return '封禁用户'
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

.page-content {
  padding: 40px;
  min-height: 0;
  font-family: 'Segoe UI', sans-serif;
  background: #fff;
  padding-bottom: 100%;
  border-right: 1.5px solid rgba(0, 0, 0, 0.4);
}

h1 {
  font-size: 24px;
  margin-bottom: 6px;
  color: #222;
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
  background-color: #f7f7f7;
  box-sizing: border-box;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
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
  background-color: #fff;
  font-weight: 600;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filters select:focus, .filters select:active {
  outline: none;
  border: none;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
}

.filters select{
  min-width: 200px;
  max-width: 300px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
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
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
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

.loader {
  display: block;
  --height-of-loader: 4px;
  --loader-color: #0071e2;
  width: 130px;
  height: var(--height-of-loader);
  border-radius: 30px;
  background-color: rgba(0,0,0,0.2);
  position: relative;
}
.loader::before {
  content: "";
  position: absolute;
  background: var(--loader-color);
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  border-radius: 30px;
  animation: moving 1s ease-in-out infinite;
}
@keyframes moving {
  50% {
    width: 100%;
  }
  100% {
    width: 0;
    right: 0;
    left: unset;
  }
}

.loading-tip {
  font-size: 14px;
  color: #666;
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

.custom-dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.custom-dialog {
  background: #fff !important;
  border-radius: 0.5rem !important;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2) !important;
  min-width: 340px;
  max-width: 90vw;
  padding: 24px 28px 18px 28px;
  position: relative;
  margin-top: 200px;
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
}

.page-content, .radio-inputs, .radio, .filters, .report-list, .action-btn, .empty-tip, .loading-tip {
  color: #222 !important;
}

.card-style {
  background: #fff !important;
  border-radius: 12px;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
}

.input {
  max-width: 190px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
  outline: none;
  color: dimgray;
}

</style>