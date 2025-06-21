<template>
  <div v-if="visible" class="delete-dialog-overlay" @click="handleOverlayClick">
    <div class="delete-dialog-container" @click.stop>
      <!-- 对话框头部 -->
      <div class="delete-dialog-header">
        <h3 class="delete-dialog-title">{{ title }}</h3>
        <button class="delete-dialog-close" @click="handleCancel" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 对话框主体 -->
      <div class="delete-dialog-body">
        <div class="delete-dialog-content">
          <div class="delete-dialog-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div class="delete-dialog-message">
            <p>{{ message }}</p>
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="delete-dialog-footer">
        <button 
          type="button"
          class="btn btn-confirm" 
          @click="handleConfirm"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '删除中...' : '确定' }}
        </button>
        <button 
          type="button"
          class="btn btn-cancel" 
          @click="handleCancel"
          :disabled="loading"
        >
          取消
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
  // 弹窗标题
  title: {
    type: String,
    default: '提示'
  },
  // 确认消息
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// 计算属性：弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 处理确认操作
const handleConfirm = () => {
  emit('confirm');
};

// 处理取消操作
const handleCancel = () => {
  emit('cancel');
  visible.value = false;
};

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (!props.loading) {
    handleCancel();
  }
};
</script>

<style scoped>
/* 遮罩层样式 */
.delete-dialog-overlay {
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
.delete-dialog-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 对话框头部 */
.delete-dialog-header {
  background: linear-gradient(90deg, #ff4500, #ff6b35);
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  box-sizing: border-box;
}

.delete-dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.3px;
}

.delete-dialog-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.delete-dialog-close:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

/* 对话框主体 */
.delete-dialog-body {
  padding: 32px 24px;
  background: white;
  flex: 1;
}

.delete-dialog-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.delete-dialog-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  color: #ff4500;
}

.delete-dialog-message {
  flex: 1;
}

.delete-dialog-message p {
  margin: 0;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}

/* 对话框底部 */
.delete-dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 20px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  height: 60px;
  box-sizing: border-box;
  align-items: center;
}

/* 按钮样式 */
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: var(--card-bg);
  color: var(--foreground-muted);
  border-color: var(--border-color);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--background-color);
  color: var(--foreground-color);
  border-color: var(--foreground-muted);
}

.btn-confirm {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-confirm:hover:not(:disabled) {
  background: #e63e00;
  border-color: #e63e00;
}

/* 加载状态样式 */
.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .delete-dialog-container {
    width: 95%;
    margin: 16px;
  }
  
  .delete-dialog-header {
    padding: 16px 20px;
  }
  
  .delete-dialog-body {
    padding: 24px 20px;
  }
  
  .delete-dialog-footer {
    padding: 16px 20px;
    flex-direction: column;
    height: auto;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .btn:last-child {
    margin-bottom: 0;
  }
}
</style> 