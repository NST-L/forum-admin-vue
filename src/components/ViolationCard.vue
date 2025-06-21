<template>
  <div 
    class="report-item card-style" 
    :class="[cardClass, `status-${statusClass}`]"
  >
    <div class="user-avatar" v-if="showAvatar">
      <img 
        v-if="avatarUrl" 
        :src="avatarUrl" 
        :alt="reportedUsername || '用户头像'"
        class="avatar-image"
        @error="handleImageError"
      />
      <div v-else class="circle">{{ usernameFirstLetter }}</div>
    </div>

    <div class="report-main">
      <div class="report-header">
        <h3 class="truncate-text">{{ reportedContent || '被举报内容' }}</h3>
        <span :class="['status-tag', statusClass]">{{ formattedStatus }}</span>
      </div>

      <div class="report-meta">
        <p v-if="reportedUsername" class="truncate-text"><span class="label">被举报用户：</span>{{ reportedUsername }}</p>
        <p v-if="reporterId" class="truncate-text"><span class="label">举报人ID：</span>{{ reporterId }}</p>
        <p v-if="reasonText" class="truncate-text"><span class="label">举报原因：</span>{{ reasonText }}</p>
        <p v-if="reportTime" class="truncate-text"><span class="label">举报时间：</span>{{ reportTime }}</p>
        <!-- 隐藏处理相关信息，只在详情弹窗中显示 -->
        <!-- <p v-if="processorId && status !== 0"><span class="label">处理人ID：</span>{{ processorId }}</p> -->
        <!-- <p v-if="processResult && status !== 0"><span class="label">处理结果：</span>{{ processResult }}</p> -->
        <!-- <p v-if="processTime && status !== 0"><span class="label">处理时间：</span>{{ processTime }}</p> -->
      </div>

      <div class="report-footer">
        <slot name="footer">
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 被举报内容
  reportedContent: String,
  // 被举报内容ID
  reportedContentId: String,
  // 被举报用户名
  reportedUsername: String,
  // 被举报用户头像
  avatarUrl: String,
  // 举报人ID
  reporterId: String,
  // 举报原因文本
  reasonText: String,
  // 举报时间
  reportTime: String,
  // 状态数字
  status: [Number, String],
  // 状态文本
  statusText: String,
  // 处理人ID
  processorId: String,
  // 处理结果
  processResult: String,
  // 处理时间
  processTime: String,
  
  // 卡片样式
  cardClass: {
    type: String,
    default: ''
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
})

const usernameFirstLetter = computed(() => 
  (props.reportedUsername || props.reportedContent || '被')?.charAt(0)
)

const formattedStatus = computed(() => 
  props.statusText || 
  (props.status === 0 ? '待处理' : props.status === 1 ? '已处理' : '已驳回')
)

const statusClass = computed(() => 
  props.status === 0 ? 'pending' : props.status === 1 ? 'resolved' : 'rejected'
)

// 头像加载失败处理
const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}
</script>

<style scoped>
.report-item, .card-style {
  background: #fff !important;
}

.report-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-left: 4px solid transparent;
  border-radius: 12px;
  max-width: 100%;
  min-width: 0;
  position: relative;
  transition: all 0.2s ease;
}

.report-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.06), transparent);
}

.report-item:hover {
  background: #fafbfc !important;
}

/* 根据状态设置左边框颜色 */
.report-item.status-pending {
  border-left-color: #FF4500;
}

.report-item.status-resolved {
  border-left-color: #2b8a3e;
}

.report-item.status-rejected {
  border-left-color: #0079D3;
}

.user-avatar .circle {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  text-align: center;
  line-height: 48px;
  font-weight: bold;
  font-size: 18px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar .avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-main {
  flex: 1;
  min-width: 0; /* 允许flex子元素收缩 */
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.report-header h3 {
  margin: 0;
  font-size: 17px;
  color: #222;
  flex: 1;
  margin-right: 16px;
  line-height: 1.4;
  font-weight: 600;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-tag.pending {
  background: rgba(255, 69, 0, 0.15); /* 半透明橙 */
  color: #FF4500;
}

.status-tag.resolved {
  background: rgba(40, 167, 69, 0.15); /* 半透明绿 */
  color: #2b8a3e;
}

.status-tag.rejected {
  background: rgba(0, 121, 211, 0.15); /* 半透明蓝 */
  color: #0079D3;
}

.report-meta {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.report-meta .label {
  font-weight: 600;
  margin-right: 6px;
  color: #555;
}

.report-meta p {
  margin: 0;
  line-height: 1.5;
}

/* 文本截断样式 */
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block; /* 确保省略号正常工作 */
}

.report-footer {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  background: #e8e8e8;
  color: #090909;
  border-radius: 0.5em;
  border: 1px solid #e8e8e8;
  cursor: pointer;
}

.report-item, .report-header h3, .report-meta, .report-footer {
  color: #222 !important;
}
.status-tag.pending { color: #FF4500 !important; }
.status-tag.resolved { color: #2b8a3e !important; }
.status-tag.rejected { color: #0079D3 !important; }

@media (max-width: 768px) {
  .report-item {
    width: 100%;
  }
}

.card-style, .report-item, .report-header, .report-footer {
  box-shadow: none !important;
}

/* 最后一个卡片移除底部分隔线 */
.report-item:last-child::after {
  display: none;
}
</style> 