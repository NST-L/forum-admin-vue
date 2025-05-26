<template>
  <div class="page-content">
    <h1>用户管理</h1>
    <p class="description">在这里你可以管理所有用户账号、角色权限和登录记录。</p>
    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td :class="user.status === 'active' ? 'text-green' : 'text-red'">
              {{ user.status }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    return {
      users: [
        { id: 1, username: 'admin', email: 'admin@example.com', role: '管理员', status: 'active' },
        { id: 2, username: 'user1', email: 'user1@example.com', role: '普通用户', status: 'inactive' },
        { id: 3, username: 'user2', email: 'user2@example.com', role: '普通用户', status: 'active' }
      ]
    }
  }
}
</script>

<style scoped>
.page-content {
  padding: 40px;
  background-color: #DAE0E6;
  min-height: 100vh;
  color: #333;
}

h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.description {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.user-table {
  background-color: #ffffffa4;
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ccc;
}

.text-green {
  color: #28a745;
}

.text-red {
  color: #dc3545;
}

@media (max-width: 768px) {
  .page-content {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  table {
    font-size: 14px;
  }
}
</style>