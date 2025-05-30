<template>
  <div class="user-management">
    <!-- 搜索与筛选 -->
    <div class="search-filter">
      <div class="search-container">
        <input 
          v-model="searchQuery"
          placeholder="搜索用户名/手机号"
          @input="handleSearch"
        />
        <select v-model="sortOption" @change="handleSort">
          <option value="register_time">按注册时间排序</option>
          <option value="activity">按活跃度排序</option>
        </select>
      </div>
    </div>

    <!-- 用户列表表格 -->
    <div class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
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
            <td class="username" @click="viewUserPosts(user)">
              {{ user.username }}
            </td>
            <td>{{ user.phone }}</td>
            <td :class="roleClass(user.role)">{{ user.role }}</td>
            <td :class="statusClass(user.status)">{{ user.status === 'active' ? '启用' : '禁用' }}</td>
            <td>{{ formatDate(user.registeredAt) }}</td>
            <td>
              <button 
                class="status-btn" 
                @click="toggleUserStatus(user)"
                :class="user.status === 'active' ? 'disable' : 'enable'"
              >
                {{ user.status === 'active' ? '封禁' : '解封' }}
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
            <span class="label">用户名：</span>
            <span>{{ selectedUser?.username }}</span>
          </div>
          <div class="detail-row">
            <span class="label">手机号：</span>
            <span>{{ selectedUser?.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="label">角色：</span>
            <span :class="roleClass(selectedUser?.role)">{{ selectedUser?.role }}</span>
          </div>
          <div class="detail-row">
            <span class="label">状态：</span>
            <span :class="statusClass(selectedUser?.status)">
              {{ selectedUser?.status === 'active' ? '启用' : '禁用' }}
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
import { ref, computed, onMounted } from 'vue';

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
    const itemsPerPage = ref(10);
    
    // 模拟数据
    onMounted(() => {
      users.value = Array.from({length: 50}, (_, i) => ({
        id: `UID${i+1000}`,
        username: `用户${i+1}`,
        phone: `1381234567${i+1}`,
        role: i % 4 === 0 ? '管理员' : i % 4 === 1 ? '版主' : '普通用户',
        status: i % 3 === 0 ? 'inactive' : 'active',
        registeredAt: new Date(Date.now() - Math.random() * 1000000000),
        activityScore: Math.floor(Math.random() * 1000)
      }));
    });

    // 计算属性
    const filteredUsers = computed(() => {
      return users.value.filter(user => 
        user.username.includes(searchQuery.value) || 
        user.phone.includes(searchQuery.value)
      );
    });

    const sortedUsers = computed(() => {
      return [...filteredUsers.value].sort((a, b) => {
        if (sortOption.value === 'register_time') {
          return b.registeredAt - a.registeredAt;
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
      currentAction.value = user.status === 'active' ? 'disable' : 'enable';
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      banReason.value = '';
    };

    const confirmAction = () => {
      if (!banReason.value.trim()) return;
      
      const user = users.value.find(u => u.id === currentUserId.value);
      if (user) {
        user.status = currentAction.value === 'disable' ? 'inactive' : 'active';
        // 这里应添加实际的操作日志记录逻辑
        console.log(`操作日志：${currentAction.value === 'disable' ? '封禁' : '解封'}用户 ${user.username}，原因：${banReason.value}`);
      }
      
      closeModal();
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    const roleClass = (role) => {
      switch(role) {
        case '管理员': return 'admin';
        case '版主': return 'moderator';
        default: return 'user';
      }
    };

    const statusClass = (status) => {
      return status === 'active' ? 'active' : 'inactive';
    };

    const viewUserPosts = (user) => {
      selectedUser.value = {
        ...user,
        activityLogs: [
          `登录时间：${new Date().toLocaleString()}`,
          `最近发帖：Vue3新特性讨论`,
          `最后访问IP：192.168.1.${Math.floor(Math.random()*100)}`
        ]
      };
      showUserDetailModal.value = true;
    };

    const exportUserActivity = (userId) => {
      // 导出CSV逻辑
      console.log(`导出用户ID ${userId} 的行为数据`);
      // 这里可以添加实际的导出逻辑
    };

    // 新增：用户详情弹窗状态
    const showUserDetailModal = ref(false);
    const selectedUser = ref(null);

    // 新增：关闭用户详情弹窗
    const closeUserDetailModal = () => {
      showUserDetailModal.value = false;
      selectedUser.value = null;
    };

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
      statusClass,
      viewUserPosts,
      closeUserDetailModal,
      exportUserActivity,
      showUserDetailModal,
      selectedUser,
      viewUserPosts,
      closeUserDetailModal
    };
  }
};
</script>

<style scoped>
.user-management {
  padding: 40px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.search-filter {
  margin-bottom: 24px;
}

.search-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-container input {
  flex: 1 1 300px;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.search-container select {
  min-width: 180px;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.user-table th,
.user-table td {
  padding: 14px 20px;
  text-align: left;
  border-bottom: 1px solid #eee;
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

.admin { background-color: #f0f5ff; color: #1890ff; }
.moderator { background-color: #fff7f0; color: #fa8c16; }
.user { background-color: #f6ffed; color: #7cb342; }

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
  transition: all 0.2s;
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
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
</style>