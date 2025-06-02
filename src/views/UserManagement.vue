<template>
  <div class="user-management ">
    <!-- 搜索与筛选 -->
    <div class="search-filter">
      <div class="filter-bar">
        <input class="input" v-model="searchQuery" placeholder="搜索用户名/手机号" @input="handleSearch" />
        <select v-model="statusFilter">
          <option value="">全部状态</option>
          <option value="0">启用</option>
          <option value="1">禁用</option>
        </select>
        <select v-model="sortOption" @change="handleSort">
          <option value="register_time">按注册时间排序</option>
          <option value="activity">按活跃度排序</option>
        </select>
      </div>
    </div>

    <!-- 用户列表表格 -->
    <div v-if="loading" class="loading-container">
      <span class="loader"></span>
      <p class="loading-tip">正在加载数据，请稍候…</p>
    </div>
    <div v-else-if="paginatedUsers.length === 0" class="empty-container">
      <i class="fas fa-info-circle empty-icon"></i>
      <p class="empty-tip">暂无用户数据</p>
    </div>
    <div v-else class="table-container">
      <table class="user-table card-style">
        <thead>
          <tr>
            <th>ID</th>
            <th>头像</th>
            <th>用户名</th>
            <th>手机号</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <img v-if="user.avatar_url" :src="user.avatar_url" alt="头像" class="user-avatar" />
              <div v-else class="user-avatar default-avatar"></div>
            </td>
            <td class="username" @click="viewUserPosts(user)">
              {{ user.username }}
            </td>
            <td>{{ user.phone }}</td>
            <td :class="roleClass(user.role)">{{ roleText(user.role) }}</td>
            <td :class="[user.status === 1 || user.status === '1' || user.status === 'inactive' || user.status === '禁用' ? 'status-banned' : 'status-active']">
              {{ (user.status === 0 || user.status === '0' || user.status === 'active' || user.status === '正常') ? '启用' : '禁用' }}
            </td>
            <td>{{ formatDate(user.registeredAt) }}</td>
            <td>
              <button 
                class="status-btn" 
                @click="toggleUserStatus(user)"
                :class="(user.status === 0 || user.status === '0' || user.status === 'active') ? 'disable' : 'enable'"
              >
                {{ (user.status === 0 || user.status === '0' || user.status === 'active') ? '封禁' : '解封' }}
              </button>
              <button class="action-btn export" @click="exportUserActivity(user.id)">导出记录</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        下一页
      </button>
    </div>

    <!-- 封禁/解封弹窗 -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ currentAction === 'disable' ? '封禁用户' : '解封用户' }}</h3>
        <textarea 
          v-model="banReason"
          placeholder="请输入操作原因（必填）"
          rows="4"
          required
        ></textarea>
        <div class="modal-actions">
          <button class="btn cancel" @click="closeModal">取消</button>
          <button class="btn confirm" @click="confirmAction">确认</button>
        </div>
      </div>
    </div>

    <!-- 用户详情弹窗 -->
    <div v-if="showUserDetailModal" class="modal-overlay">
      <div class="modal-content" style="width: 600px;">
        <h3>用户详情</h3>
        <div class="user-detail">
          <div class="detail-row">
            <span class="label">ID：</span>
            <span>{{ selectedUser?.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">头像：</span>
            <span>
              <img v-if="selectedUser?.avatar_url" :src="selectedUser.avatar_url" alt="头像" class="user-avatar detail-avatar" />
              <div v-else class="user-avatar detail-avatar default-avatar"></div>
            </span>
          </div>
          <div class="detail-row">
            <span class="label">用户名：</span>
            <span>{{ selectedUser?.username }}</span>
          </div>
          <div class="detail-row">
            <span class="label">手机号：</span>
            <span>{{ selectedUser?.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="label">角色：</span>
            <span :class="roleClass(selectedUser?.role)">{{ roleText(selectedUser?.role) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">状态：</span>
            <span :class="statusClass(selectedUser?.status)">
              {{ (selectedUser?.status === 0 || selectedUser?.status === '0' || selectedUser?.status === 'active' || selectedUser?.status === '正常') ? '启用' : '禁用' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="label">注册时间：</span>
            <span>{{ formatDate(selectedUser?.registeredAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">操作记录：</span>
            <div class="activity-list">
              <div v-for="(log, index) in selectedUser?.activityLogs" :key="index" class="activity-item">
                {{ log }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn cancel" @click="closeUserDetailModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { getUserList, updateUserStatus, getUserDetail, exportUserActivity } from '@/api/userManagement';

export default {
  setup() {
    // 数据状态
    const users = ref([]);
    const showModal = ref(false);
    const currentAction = ref('disable');
    const currentUserId = ref(null);
    const banReason = ref('');
    const searchQuery = ref('');
    const sortOption = ref('register_time');
    const currentPage = ref(1);
    const itemsPerPage = ref(15);
    const loading = ref(false);
    
    // 新增：用户详情弹窗状态
    const showUserDetailModal = ref(false);
    const selectedUser = ref(null);
    
    const statusFilter = ref('')
    
    // 获取用户列表数据
    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await getUserList();
        if (response.data.success) {
          users.value = response.data.data.users;
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 初始化数据
    onMounted(() => {
      fetchUsers();
    });
    onUnmounted(() => {
      document.body.style.overflow = 'hidden';
    });

    // 计算属性
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        // 兼容后端返回的 role 字段（0-user/1-admin）
        const isNormalUser = user.role === 0 || user.role === '0' || user.role === 'user';
        // 状态筛选
        const matchStatus = statusFilter.value === '' || String(user.status) === statusFilter.value || (statusFilter.value === '0' && (user.status === 0 || user.status === '0' || user.status === 'active' || user.status === '正常')) || (statusFilter.value === '1' && (user.status === 1 || user.status === '1' || user.status === 'inactive' || user.status === '禁用'));
        // 支持原有搜索功能
        const matchSearch = user.username.includes(searchQuery.value) || user.phone.includes(searchQuery.value);
        return isNormalUser && matchStatus && matchSearch;
      });
    });

    const sortedUsers = computed(() => {
      return [...filteredUsers.value].sort((a, b) => {
        if (sortOption.value === 'register_time') {
          return new Date(b.registeredAt) - new Date(a.registeredAt);
        } else {
          return b.activityScore - a.activityScore;
        }
      });
    });

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return sortedUsers.value.slice(start, end);
    });

    const totalPages = computed(() => 
      Math.ceil(sortedUsers.value.length / itemsPerPage.value)
    );

    // 方法
    const handleSearch = () => {
      currentPage.value = 1;
    };

    const handleSort = () => {
      currentPage.value = 1;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const toggleUserStatus = (user) => {
      currentUserId.value = user.id;
      // status: 0-正常/1-封禁
      currentAction.value = (user.status === 0 || user.status === '0' || user.status === 'active' || user.status === '正常') ? 'disable' : 'enable';
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      banReason.value = '';
    };

    const confirmAction = async () => {
      if (!banReason.value.trim()) return;
      try {
        // status: 0-正常/1-封禁
        const newStatus = currentAction.value === 'disable' ? 1 : 0;
        const response = await updateUserStatus(currentUserId.value, newStatus, banReason.value);
        if (response.data.success) {
          const user = users.value.find(u => u.id === currentUserId.value);
          if (user) {
            user.status = newStatus;
          }
          console.log(response.data.message);
        }
      } catch (error) {
        console.error('更新用户状态失败:', error);
      }
      closeModal();
    };

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d)) return date;
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    // 角色样式
    const roleClass = (role) => {
      if (role === 1 || role === '1' || role === 'admin' || role === '管理员') return 'admin';
      if (role === 'moderator' || role === '版主') return 'moderator';
      return 'user';
    };

    // 角色显示文本
    const roleText = (role) => {
      if (role === 1 || role === '1' || role === 'admin' || role === '管理员') return '管理员';
      if (role === 'moderator' || role === '版主') return '版主';
      return '用户';
    };

    const statusClass = (status) => {
      // status: 0-正常/1-封禁，兼容字符串和原有 active/inactive
      if (status === 0 || status === '0' || status === 'active' || status === '正常') return 'active';
      return 'inactive';
    };

    const viewUserPosts = async (user) => {
      try {
        const response = await getUserDetail(user.id);
        if (response.data.success) {
          selectedUser.value = response.data.data;
          showUserDetailModal.value = true;
        }
      } catch (error) {
        console.error('获取用户详情失败:', error);
      }
    };

    const closeUserDetailModal = () => {
      showUserDetailModal.value = false;
      selectedUser.value = null;
    };

    const handleExportUserActivity = async (userId) => {
      try {
        const response = await exportUserActivity(userId);
        if (response.data.success) {
          console.log(response.data.message);
        }
      } catch (error) {
        console.error('导出用户活动记录失败:', error);
      }
    };

    // 监听用户详情弹窗状态，动态切换body overflow
    watch(() => showUserDetailModal.value, (val) => {
      if (val) {
        document.body.style.overflow = 'auto';
      } else {
        document.body.style.overflow = 'hidden';
      }
    });

    return {
      users,
      showModal,
      currentAction,
      currentUserId,
      banReason,
      searchQuery,
      sortOption,
      currentPage,
      itemsPerPage,
      loading,
      paginatedUsers,
      totalPages,
      handleSearch,
      handleSort,
      nextPage,
      prevPage,
      toggleUserStatus,
      closeModal,
      confirmAction,
      formatDate,
      roleClass,
      roleText,
      statusClass,
      viewUserPosts,
      closeUserDetailModal,
      exportUserActivity: handleExportUserActivity,
      showUserDetailModal,
      selectedUser,
      statusFilter
    };
  }
};
</script>

<style scoped>
.user-management {
  padding: 40px;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: 40px;
  font-family: 'Segoe UI', sans-serif;
  background: #fff;
  border-right: 1.5px solid rgba(0, 0, 0, 0.4);
  padding-bottom: 100%;
}

.search-filter {
  margin-bottom: 24px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-bar select {
  min-width: 200px;
  max-width: 300px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
  outline: none;
  color: rgb(0, 0, 0);
}

.card-style {
  background: #fff !important;
  border-radius: 12px;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
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
}

.username {
  color: #1890ff;
  cursor: pointer;
  text-decoration: underline;
}

.role-class {
  padding: 4px 8px;
  border-radius: 4px;
}

.admin { color: #1890ff; background: none !important; }
.moderator { color: #fa8c16; background: none !important; }
.user { color: #7cb342; background: none !important; }

.status-class.active {
  color: #52c41a;
  font-weight: 500;
}

.status-class.inactive {
  color: #ff4d4f;
  font-weight: 500;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
  background: #fff !important;
  border-radius: 12px;
  box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

.page-btn:hover {
  background-color: #f0f0f0;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.status-btn {
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.status-btn.disable {
  background-color: #ff4d4f;
  color: white;
}

.status-btn.enable {
  background-color: #52c41a;
  color: white;
}

.action-btn.export {
  background-color: #1890ff;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff !important;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-top: 200px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  color: #1a1a1a;
}

.modal-content textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-actions .btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.modal-actions .cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
}

.modal-actions .confirm {
  background-color: #1890ff;
  color: white;
  border: none;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.activity-list {
  margin-left: 80px;
  border-left: 1px solid #eee;
  padding-left: 12px;
}

.activity-item {
  padding: 4px 0;
  font-size: 13px;
  color: #555;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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
  color: #888;
  font-size: 14px;
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

.status-banned {
  background-color: rgba(255, 77, 79, 0.18) !important;
  color: #ff4d4f !important;
}

.status-active {
  background-color: rgba(82, 196, 26, 0.13) !important;
  color: #52c41a !important;
}

.user-management, .user-table th, .user-table td, .filter-bar input, .filter-bar select, .pagination, .modal-content, .modal-content h3, .detail-row, .label, .activity-item, .empty-tip, .loading-tip {
  color: #222 !important;
}
.status-class.active, .status-class.inactive {
  color: #222 !important;
}

.stat-card {
  background: rgba(255,255,255,0.18) !important;
  box-shadow: 0 4px 16px 0 rgba(31,38,135,0.08) !important;
  border-radius: 0.5rem !important;
  padding: 16px;
  flex: 1;
  text-align: center;
  cursor: pointer;
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

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  display: inline-block;
}
.default-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eee;
  display: inline-block;
}
</style>