<template>
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-container" @click.stop>
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <h3 class="dialog-title">举报业务ID：{{ reportData?.id || '未知' }}</h3>
        <button class="dialog-close" @click="handleClose" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 对话框主体 -->
      <div class="dialog-body">
        <div v-if="reportData" class="dialog-content">
          <!-- 用户信息区域 -->
          <div class="user-section">
            <div v-if="reportData.username" class="user-header">
              <div class="avatar-container">
                <img 
                  v-if="reportData.avatarUrl" 
                  :src="reportData.avatarUrl" 
                  :alt="reportData.username"
                  class="user-avatar"
                  @error="handleAvatarError"
                />
                <div v-else class="default-avatar">{{ reportData.username.charAt(0) }}</div>
              </div>
              <div class="user-info">
                <div class="username">{{ reportData.username }}</div>
                <div class="user-id">{{ getComponentIdLabel() }}: {{ reportData.componentId }}</div>
              </div>
            </div>
            
            <div v-if="reportData.content" class="content-section">
              <div class="section-label">{{ getContentLabel() }}</div>
              <div class="content-display">{{ reportData.content }}</div>
            </div>
          </div>
          
          <!-- 分割线 -->
          <div class="divider"></div>
          
          <!-- 举报详情区域 -->
          <div class="report-section">
            <div class="section-title">举报信息</div>
            <div class="info-rows">
              <div class="info-row">
                <div class="label">举报人ID</div>
                <div class="value">{{ reportData.reporterId }}</div>
              </div>
              <div class="info-row">
                <div class="label">举报原因</div>
                <div class="value">
                  <span class="reason-badge">{{ reportData.reasonText }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="label">举报时间</div>
                <div class="value">{{ reportData.reportTime }}</div>
              </div>
            </div>
          </div>
          
          <!-- 分割线 -->
          <div class="divider"></div>
          
          <!-- 处理状态区域 -->
          <div class="process-section">
            <div class="section-title">
              处理信息
              <div class="status-indicator" :class="getStatusClass(reportData.statusText)">
                {{ reportData.statusText }}
              </div>
            </div>
            
            <div class="info-rows">
              <div v-if="reportData.processorId" class="info-row">
                <div class="label">处理人ID</div>
                <div class="value">{{ reportData.processorId }}</div>
              </div>
              <div v-if="reportData.processTime" class="info-row">
                <div class="label">处理时间</div>
                <div class="value">{{ reportData.processTime }}</div>
              </div>
              <div class="info-row full">
                <div class="label">处理意见</div>
                <div class="value result-text">{{ reportData.processResult || reportData.processOpinion || '暂无处理意见' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="dialog-footer">
        <button 
          type="button"
          class="btn btn-primary" 
          @click="handleClose"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 定义组件属性
const props = defineProps({
  // 弹窗显示状态
  modelValue: {
    type: Boolean,
    default: false
  },
  // 举报数据
  reportData: {
    type: Object,
    default: null
  },
  // 违规类型：POST、COMMENT、USER
  violationType: {
    type: String,
    default: 'POST',
    validator: (value) => ['POST', 'COMMENT', 'USER'].includes(value)
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'close']);

// 计算属性：弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 获取内容标题
const getContentTitle = () => {
  const titles = {
    POST: '帖子信息',
    COMMENT: '评论信息',
    USER: '用户信息'
  };
  return titles[props.violationType] || '内容信息';
};

// 获取内容标签
const getContentLabel = () => {
  const labels = {
    POST: '帖子内容',
    COMMENT: '评论内容',
    USER: '用户简介'
  };
  return labels[props.violationType] || '内容';
};

// 获取被举报内容ID的标签
const getComponentIdLabel = () => {
  const labels = {
    POST: '被举报帖子ID',
    COMMENT: '被举报评论ID',
    USER: '被举报用户ID'
  };
  return labels[props.violationType] || '被举报内容ID';
};

// 处理关闭操作
const handleClose = () => {
  emit('close');
  visible.value = false;
};

// 处理遮罩层点击
const handleOverlayClick = () => {
  handleClose();
};

// 头像加载失败处理
const handleAvatarError = (event) => {
  event.target.style.display = 'none';
  const defaultAvatar = event.target.nextElementSibling;
  if (defaultAvatar) {
    defaultAvatar.style.display = 'flex';
  }
};

// 获取状态样式类
const getStatusClass = (statusText) => {
  if (statusText === '待处理') return 'status-pending';
  if (statusText === '已处理') return 'status-resolved';
  if (statusText === '已驳回') return 'status-rejected';
  return 'status-default';
};
</script>

<style scoped>
/* 遮罩层样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 27, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* 对话框容器 */
.dialog-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 对话框头部 */
.dialog-header {
  background: linear-gradient(135deg, #ff4500, #ff6b35);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  box-sizing: border-box;
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.3px;
}

.dialog-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

/* 对话框主体 */
.dialog-body {
  padding: 24px;
  background: white;
  flex: 1;
  overflow-y: auto;
  min-height: 300px;
}

.dialog-content h3 {
  margin: 16px 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.dialog-content h3:first-child {
  margin-top: 0;
}

.dialog-content p {
  margin: 6px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.dialog-content b {
  font-weight: 600;
  color: #333;
}

/* 用户信息区域 */
.user-section {
  margin-bottom: 24px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar-container {
  flex-shrink: 0;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.default-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF4500 0%, #ff6b35 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-info {
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.user-id {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

/* 内容区域 */
.content-section {
  margin-top: 16px;
}

.section-label {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
}

.content-display {
  background: #f8f9fa;
  padding: 14px;
  border-radius: 8px;
  color: #495057;
  line-height: 1.6;
  font-size: 14px;
}

/* 分割线 */
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e9ecef 20%, #e9ecef 80%, transparent 100%);
  margin: 24px 0;
}

/* 区域标题 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 信息行布局 */
.info-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.info-row.full {
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
}

/* 特殊标签样式 */
.reason-badge {
  background: #fff3cd;
  color: #856404;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}



.result-text {
  background: #f8f9fa;
  padding: 10px 12px;
  border-radius: 6px;
  color: #495057;
  line-height: 1.5;
  margin-top: 4px;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 60px;
  box-sizing: border-box;
  align-items: center;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 2px solid transparent;
  min-width: 80px;
  letter-spacing: -0.2px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background: #e63e00;
  border-color: #e63e00;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-container {
    width: 95%;
    margin: 16px;
  }
  
  .dialog-header {
    padding: 16px 20px;
  }
  
  .dialog-body {
    padding: 16px;
  }
  
  .dialog-footer {
    padding: 16px 20px;
  }
  
  .btn {
    width: 100%;
  }
  
  /* 用户信息响应式 */
  .user-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .user-avatar,
  .default-avatar {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
  
  .username {
    font-size: 18px;
  }
  
  /* 信息行响应式 */
  .info-row {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .label {
    min-width: auto;
    font-size: 12px;
  }
  
  .section-title {
    font-size: 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  /* 内容区域响应式 */
  .content-display {
    padding: 12px;
  }
  
  .result-text {
    padding: 8px 10px;
  }
  
  /* 分割线响应式 */
  .divider {
    margin: 16px 0;
  }
}
</style> 