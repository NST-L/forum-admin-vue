<template>
  <div class="page-content">
    <h1>举报处理机制</h1>
    <p class="description">在这里你可以查看所有用户举报并进行处理。</p>
    <div class="report-list">
      <div class="report-item" v-for="report in reports" :key="report.id">
        <h3>{{ report.title }}</h3>
        <p class="reporter">举报人：{{ report.reporter }}</p>
        <p class="reason">举报原因：{{ report.reason }}</p>
        <button class="action-btn">查看详情</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportHandling',
  data() {
    return {
      reports: [
        { id: 1, title: '内容1被举报', reporter: '张三', reason: '涉嫌违规' },
        { id: 2, title: '内容2被举报', reporter: '李四', reason: '虚假信息' },
        { id: 3, title: '内容3被举报', reporter: '王五', reason: '广告' }
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

.report-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-item {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.reporter, .reason {
  margin: 5px 0;
}

.action-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .page-content {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  .report-item {
    font-size: 14px;
  }
}
</style>