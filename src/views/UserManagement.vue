<template>
  <div class="user-management">
    <h1 class="page-title">用户管理</h1>
    <!-- 搜索与筛选 -->
    <div class="search-filter">
      <div class="filter-bar">
          <input class="input" v-model="searchForm.keyword" placeholder="搜索用户名/手机号/邮箱" @input="handleSearch" />
          <select class="input" v-model="searchForm.status" @change="handleSearch">
          <option value="">全部状态</option>
          <option value="0">启用</option>
          <option value="1">禁用</option>
        </select>
      </div>
    </div>

    <!-- 用户列表表格 -->
    <div class="table-container">
      <table class="user-table card-style">
        <thead>
          <tr>
            <th>ID</th>
            <th>头像</th>
            <th>用户名</th>
            <th>手机号</th>
            <th>邮箱</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody v-if="users.length > 0">
          <tr v-for="user in users" :key="user.userId">
            <td>{{ user.userId }}</td>
            <td>
              <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="头像" class="user-avatar" />
              <div v-else class="user-avatar default-avatar">{{ getDisplayName(user).charAt(0) }}</div>
            </td>
            <td class="username" @click="viewUserDetail(user)">
              {{ getDisplayName(user) }}
            </td>
            <td>{{ user.phone }}</td>
            <td>{{ user.email }}</td>
            <td :class="[user.status === 1 || user.status === '1' ? 'status-banned' : 'status-active']">
              {{ user.status === 0 || user.status === '0' ? '启用' : '禁用' }}
            </td>
            <td>{{ formatDate(user.ctime) }}</td>
            <td>
              <button 
                class="status-btn" 
                @click="toggleUserStatus(user)"
                :class="user.status === 0 || user.status === '0' ? 'disable' : 'enable'"
              >
                {{ user.status === 0 || user.status === '0' ? '封禁' : '解封' }}
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="8">
              <div class="empty-container">
                <i class="fas fa-info-circle empty-icon"></i>
                <p class="empty-tip">暂无用户数据</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination left-align" v-if="totalPages > 0">
      <button @click="handlePageChange(searchForm.page_num - 1)" :disabled="searchForm.page_num <= 1" class="page-btn">上一页</button>
      <span class="page-info">第 {{ searchForm.page_num }} 页 / 共 {{ totalPages }} 页 (总计 {{ total }} 条记录)</span>
      <button @click="handlePageChange(searchForm.page_num + 1)" :disabled="searchForm.page_num >= totalPages" class="page-btn">下一页</button>
    </div>
    <div class="pagination left-align" v-else>
      <span class="page-info">暂无数据</span>
    </div>

    <!-- 封禁/解封确认弹窗 -->
    <DeleteConfirmDialog
      v-model="deleteDialogVisible"
      :title="currentAction === 'disable' ? '封禁用户' : '解封用户'"
      :message="`确认要${currentAction === 'disable' ? '封禁' : '解封'}用户「${getDisplayName(currentUser)}」吗？`"
      :loading="deleteLoading"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />

    <!-- 用户详情弹窗 -->
    <div v-if="showUserDetailModal" class="custom-modal-overlay">
      <div class="custom-modal-content custom-modal-large">
        <div class="custom-modal-header">
          <h3>用户详情</h3>
        </div>
        <div class="custom-modal-body">
          <div class="user-detail">
            <div class="detail-row">
              <span class="label">ID：</span>
              <span>{{ selectedUser?.userId }}</span>
            </div>
            <div class="detail-row">
              <span class="label">头像：</span>
              <span>
                <img v-if="selectedUser?.avatarUrl" :src="selectedUser.avatarUrl" alt="头像" class="user-avatar detail-avatar" />
                <div v-else class="user-avatar detail-avatar default-avatar">{{ getDisplayName(selectedUser).charAt(0) }}</div>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">用户名：</span>
              <span>{{ getDisplayName(selectedUser) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">手机号：</span>
              <span>{{ selectedUser?.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">邮箱：</span>
              <span>{{ selectedUser?.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">个人简介：</span>
              <span>{{ selectedUser?.profile || '暂无' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">状态：</span>
              <span :class="statusClass(selectedUser?.status)">
                {{ selectedUser?.status === 0 || selectedUser?.status === '0' ? '启用' : '禁用' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">注册时间：</span>
              <span>{{ formatDate(selectedUser?.ctime) }}</span>
            </div>
          </div>
        </div>
        <div class="custom-dialog-footer">
          <button class="custom-btn custom-btn-cancel" @click="closeUserDetailModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserList, updateUserStatus } from '@/api/userManagement';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue';

    const users = ref([]);
const total = ref(0);
const totalPages = ref(0);  // 使用后端返回的页数，不再计算
const searchForm = reactive({
  keyword: '',
  status: '',
  page_num: 1,
  page_size: 10
});
    
// 弹窗状态
    const showUserDetailModal = ref(false);
    const selectedUser = ref(null);
    
// DeleteConfirmDialog相关状态
const deleteDialogVisible = ref(false);
const deleteLoading = ref(false);
const currentUser = ref(null);
const currentAction = ref('disable');

function fetchUsers() {
  
  // 确保分页参数有效
  const requestParams = {
    keyword: searchForm.keyword || '',
    page_num: searchForm.page_num || 1,
    page_size: searchForm.page_size || 10,
    fetch_all: false
    };
    
  // 只在status有实际值时才添加status参数
  if (searchForm.status && searchForm.status !== '') {
    requestParams.status = parseInt(searchForm.status);
  }
  
  getUserList(requestParams).then(res => {
    // 根据后端Result<PageVO<UserVO>>结构处理响应
    if (res.data && res.data.success) {
      
      // 后端返回的是PageVO结构: { total_count, page_count, list }
      if (res.data.data && res.data.data.list) {
        // 处理用户数据，根据后端UserVO结构映射字段
        const processedUsers = res.data.data.list.map(user => {
          return {
            userId: user.userId,
            username: user.username,
            phone: user.phone,
            email: user.email,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl,
            ctime: user.ctime,
            profile: user.profile
          };
        });
        
        users.value = processedUsers;
        total.value = res.data.data.total_count || 0;
        // 如果总记录数为0，页数也应该为0
        totalPages.value = (res.data.data.total_count > 0) ? (res.data.data.page_count || 1) : 0;
        
        // 如果当前页没有数据且不是第一页，则跳转到第一页
        if (users.value.length === 0 && searchForm.page_num > 1) {
          searchForm.page_num = 1;
          fetchUsers();
          return;
        }
      } else {
        console.error('数据格式错误 - 缺少data.list字段');
        console.error('res.data.data:', res.data.data);
        users.value = [];
        total.value = 0;
        totalPages.value = 0;
        ElMessage.error('数据格式错误');
      }
    } else {
      console.error('API调用失败');
      console.error('失败原因:', res.data?.message);
      users.value = [];
      total.value = 0;
      totalPages.value = 0;
      ElMessage.error(res.data?.message || '获取用户失败');
    }
  }).catch(error => {
    console.error('=== 请求异常 ===');
    console.error('错误对象:', error);
    console.error('错误消息:', error.message);
    console.error('错误响应:', error.response);
    users.value = [];
    total.value = 0;
    totalPages.value = 0;
    ElMessage.error('请求失败：' + (error.message || '未知错误'));
  });
  

}

function handlePageChange(page) {
  // 基本边界检查
  if (totalPages.value === 0 || page < 1 || page > totalPages.value || page === searchForm.page_num) {
    return;
  }
  
  searchForm.page_num = page;
  fetchUsers();
}

function handleSearch() {
  searchForm.page_num = 1;
  // 添加防抖延迟，避免频繁请求
  clearTimeout(window.userSearchTimeout);
  window.userSearchTimeout = setTimeout(() => {
    fetchUsers();
  }, 300);
}

function toggleUserStatus(user) {
  currentUser.value = user;
  currentAction.value = (user.status === 0 || user.status === '0') ? 'disable' : 'enable';
  deleteDialogVisible.value = true;
}

function handleDeleteConfirm() {
  if (!currentUser.value) return;
  
  deleteLoading.value = true;
  confirmAction();
}

function handleDeleteCancel() {
  deleteDialogVisible.value = false;
  currentUser.value = null;
}

async function confirmAction() {
  try {
    const actionText = currentAction.value === 'disable' ? '封禁' : '解封';
  
    
    // 根据操作类型确定新状态：0-正常，1-封禁
        const newStatus = currentAction.value === 'disable' ? 1 : 0;
    
    // 调用后端接口更新用户状态
    const response = await updateUserStatus(currentUser.value.userId, newStatus);
    
    // 检查响应结构 - 后端返回Result<Boolean>结构
    if (response && response.data && response.data.success === true) {
      ElMessage.success(`用户${actionText}成功`);
      // 重新获取用户列表数据
      fetchUsers();
      // 关闭弹窗
      deleteDialogVisible.value = false;
    } else {
      const errorMessage = response.data?.message || '操作失败';
      ElMessage.error(errorMessage);
        }
      } catch (error) {
    console.error('用户状态更新失败:', error);
    
    // 根据错误类型显示不同的错误信息
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(error.response.data.message);
    } else if (error.message) {
      ElMessage.error('操作失败：' + error.message);
    } else {
      ElMessage.error('操作失败，请稍后重试');
    }
  } finally {
    deleteLoading.value = false;
    currentUser.value = null;
  }
}

function viewUserDetail(user) {

  
  // 直接使用已有的用户数据
  selectedUser.value = {
    userId: user.userId,
    username: user.username,
    phone: user.phone,
    email: user.email,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    ctime: user.ctime,
    profile: user.profile
  };
  
  showUserDetailModal.value = true;
}

function closeUserDetailModal() {
  showUserDetailModal.value = false;
  selectedUser.value = null;
}

function formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d)) return date;
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
}

function statusClass(status) {
  if (status === 0 || status === '0') return 'active';
      return 'inactive';
}

function getDisplayName(user) {
  if (!user) return '';
  if (user.username) return user.username;
  if (user.email) return user.email.split('@')[0];
  if (user.phone) return user.phone;
  return user.userId || '未知用户';
}

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>


.user-management {
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

.search-filter {
  margin-bottom: 24px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.input {
  max-width: 190px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  outline: none;
  color: dimgray;
}

.filter-bar select {
  min-width: 120px;
  max-width: 200px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  outline: none;
  color: dimgray;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
  background: #fff !important;
  border-radius: 12px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.user-table th,
.user-table td {
  padding: 14px 20px;
  text-align: left;
  border-bottom: 1px solid #eee;
  background: transparent !important;
}

.user-table th {
  background-color: #e8ecf0;
  font-weight: 500;
  color: #333;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  text-align: center;
}

.user-table td {
  background-color: #fff;
  text-align: center;
}

.username {
  color: #1890ff;
  cursor: pointer;
  text-decoration: underline;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.default-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF4500, #FF6B35);
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.detail-avatar {
  width: 60px;
  height: 60px;
  font-size: 24px;
}



.status-btn {
  padding: 8px 16px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  background-color: rgba(0, 121, 211, 0.1);
  color: #0079D3;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.2px;
}

.status-btn:hover {
  background-color: #0079D3;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 121, 211, 0.3);
}

.status-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 状态列样式 */
.status-active {
  color: #52c41a;
  font-weight: 600;
}

.status-banned {
  color: #ff4d4f;
  font-weight: 600;
}

/* 按钮状态样式 */
.status-btn.disable {
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.status-btn.disable:hover {
  background-color: #ff4d4f;
  color: #fff;
  box-shadow: 0 4px 8px rgba(255, 77, 79, 0.3);
}

.status-btn.enable {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-btn.enable:hover {
  background-color: #52c41a;
  color: #fff;
  box-shadow: 0 4px 8px rgba(82, 196, 26, 0.3);
}



.page-btn {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  letter-spacing: -0.2px;
}

.page-btn:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #FF4500;
  color: #FF4500;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 69, 0, 0.15);
}

.page-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.page-btn:disabled {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination.left-align {
  justify-content: flex-start;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  background: #fff !important;
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

/* 弹窗样式 - 仅保留用户详情弹窗样式 */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.custom-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.custom-modal-large {
  width: 600px;
}

.custom-modal-header {
  background: linear-gradient(135deg, #FF4500 0%, #FF6B35 100%);
  color: white;
  padding: 20px 24px;
  margin: 0;
}

.custom-modal-header h3 {
  margin: 0;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.custom-modal-body {
  padding: 24px;
  background: #fff;
}

.custom-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8f9fa;
}

.custom-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.custom-btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.custom-btn-cancel:hover {
  background-color: #e0e0e0;
}

/* 用户详情样式 */
.user-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-row .label {
  min-width: 80px;
  font-weight: 600;
  color: #333;
}

.active {
  color: #52c41a;
  font-weight: 600;
}

.inactive {
  color: #ff4d4f;
  font-weight: 600;
}
</style>