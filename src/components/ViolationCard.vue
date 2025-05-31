<template>
  <div 
    class="report-item" 
    :class="cardClass"
  >
    <div class="user-avatar" v-if="showAvatar">
      <div class="circle">{{ usernameFirstLetter }}</div>
    </div>

    <div class="report-main">
      <div class="report-header">
        <h3>{{ title }}</h3>
        <span class="status-tag" :class="statusClass">
          {{ formattedStatus }}
        </span>
      </div>

      <div class="report-meta">
        <p v-if="userId"><span class="label">用户ID：</span>{{ userId }}</p>
        <p v-if="reporter"><span class="label">举报人：</span>{{ reporter }} <span v-if="reporterId">(ID: {{ reporterId }})</span></p>
        <p v-if="reason"><span class="label">举报原因：</span>{{ reason }}</p>
        <p v-if="date"><span class="label">举报时间：</span>{{ date }}</p>
        <p v-if="processor"><span class="label">处理人：</span>{{ processor }}</p>
      </div>

      <div class="report-footer">
        <slot name="footer">
          <button v-if="status === 0" class="action-btn primary">处理举报</button>
          <button v-else class="action-btn gray">查看详情</button>
          <button class="action-btn warn">查看用户</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  status: {
    type: Number,
    default: 0
  },
  userId: String,
  reporter: String,
  reporterId: String,
  reason: String,
  date: String,
  processor: String,
  showAvatar: {
    type: Boolean,
    default: true
  },
  cardClass: {
    type: String,
    default: ''
  }
})

const usernameFirstLetter = computed(() => props.title ? props.title[0] : '')
const formattedStatus = computed(() => props.status === 0 ? '待处理' : '已处理')
const statusClass = computed(() => props.status === 0 ? 'pending' : 'resolved')
</script>

<style scoped>
.report-item {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  width: calc(33.333% - 14px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-left: 4px solid transparent;
}

.user-avatar .circle {
  width: 40px;
  height: 40px;
  background: #dee2e6;
  border-radius: 50%;
  text-align: center;
  line-height: 40px;
  font-weight: bold;
  font-size: 16px;
  color: #495057;
}

.report-main {
  flex: 1;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.report-header h3 {
  margin: 0;
  font-size: 16px;
  color: #222;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-tag.pending {
  background: #ffe3e3;
  color: #e03131;
}

.status-tag.resolved {
  background: #d3f9d8;
  color: #2b8a3e;
}

.report-meta {
  font-size: 13px;
  color: #555;
  margin-bottom: 10px;
}

.report-meta .label {
  font-weight: 600;
  margin-right: 4px;
}

.report-footer {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

@media (max-width: 768px) {
  .report-item {
    width: 100%;
  }
}
</style> 