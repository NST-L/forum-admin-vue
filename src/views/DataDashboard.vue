<template>
  <div class="page-content">
    <h1>后台数据管理</h1>
    <p class="description">在这里你可以查看和管理所有系统数据。</p>
    <div class="data-stats">
      <div class="stat-card">
        <h3>总用户数</h3>
        <p class="number">10,000</p>
      </div>
      <div class="stat-card">
        <h3>总数据量</h3>
        <p class="number">500 GB</p>
      </div>
      <div class="stat-card">
        <h3>在线设备</h3>
        <p class="number">150</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataDashboard'
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

.data-stats {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.stat-card {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  text-align: center;
}

.number {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .page-content {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  .data-stats {
    flex-direction: column;
  }

  .stat-card {
    font-size: 14px;
  }
}
</style>