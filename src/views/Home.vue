<template>
  <div class="page-content">
    <h1>欢迎来到管理员后台</h1>
    <p class="description">这里是首页，你可以查看系统概览或常用功能快捷入口。</p>
    <div class="card-grid">
      <div class="card">用户总数：{{ userCount }}</div>
      <div class="card">内容总数：{{ contentCount }}</div>
      <div class="card">系统运行时间：{{ uptime }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      userCount: 1000,
      contentCount: 5000,
      uptime: '30天'
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.card {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-content {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }
}
</style>