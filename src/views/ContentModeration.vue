<template>
  <div class="page-content">
    <h1>内容审核与违规处理</h1>
    <p class="description">在这里你可以查看待审核内容并处理违规行为。</p>
    <div class="content-list">
      <div class="content-item" v-for="item in content" :key="item.id">
        <h3>{{ item.title }}</h3>
        <p class="author">作者：{{ item.author }}</p>
        <p class="status">状态：{{ item.status }}</p>
        <button class="action-btn">查看详情</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContentModeration',
  data() {
    return {
      content: [
        { id: 1, title: '文章1', author: '张三', status: '待审核' },
        { id: 2, title: '视频2', author: '李四', status: '已违规' },
        { id: 3, title: '图片3', author: '王五', status: '通过' }
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

.content-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-item {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.author, .status {
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

  .content-item {
    font-size: 14px;
  }
}
</style>