<template>
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-container" @click.stop>
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <h3 class="dialog-title">处理违规举报</h3>
        <button class="dialog-close" @click="handleCancel" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 对话框主体 -->
      <div class="dialog-body">
        <div v-if="reportData" class="dialog-content">
          <!-- 用户信息区域 -->
          <div class="content-section">
            <div class="section-header">
              <h3 class="section-title">{{ getContentTitle() }}</h3>
            </div>
            
            <div v-if="reportData.username" class="user-info">
                                              <div 
                  class="avatar-container" 
                  :data-has-preview="!!reportData.avatarUrl"
                  @mouseenter="showAvatarPreview" 
                  @mouseleave="hideAvatarPreview" 
                  ref="avatarRef"
                >
                <img 
                  v-if="reportData.avatarUrl" 
                  :src="reportData.avatarUrl" 
                  :alt="reportData.username"
                  class="user-avatar"
                  @error="handleAvatarError"
                />
                                  <div v-else class="default-avatar">{{ reportData.username.charAt(0) }}</div>
              </div>
              <div class="user-details">
                <div class="info-row">
                  <div class="label">被举报用户</div>
                  <div class="value">{{ reportData.username }}</div>
                </div>
                <div v-if="reportData.componentId" class="info-row">
                  <div class="label">{{ getComponentIdLabel() }}</div>
                  <div class="value">{{ reportData.componentId }}</div>
                </div>
              </div>
            </div>
            
            <div v-if="reportData.content" class="content-text">
              <div class="label">{{ getContentLabel() }}</div>
              <div class="value content-value">{{ reportData.content }}</div>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="section-divider"></div>
          
          <!-- 举报信息区域 -->
          <div class="content-section">
            <div class="section-header">
              <h3 class="section-title">举报信息</h3>
            </div>
            
            <div class="info-grid">
              <div class="info-row">
                <div class="label">举报人ID</div>
                <div class="value">{{ reportData.reporterId }}</div>
              </div>
              <div class="info-row">
                <div class="label">举报原因</div>
                <div class="value">{{ reportData.reasonText }}</div>
              </div>
              <div class="info-row">
                <div class="label">举报时间</div>
                <div class="value">{{ reportData.reportTime }}</div>
              </div>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="section-divider"></div>
          
          <!-- 处理意见区域 -->
          <div class="content-section">
            <div class="section-header">
              <h3 class="section-title">处理意见 <span class="required">*</span></h3>
            </div>
            
            <div class="form-group">
              <textarea 
                v-model="processOpinion"
                class="process-opinion-input"
                :class="{ 'error': showValidation && !processOpinion.trim() }"
                placeholder="请输入处理意见（必填）"
                rows="4"
                maxlength="500"
              ></textarea>
              <div v-if="showValidation && !processOpinion.trim()" class="error-message">
                处理意见不能为空
              </div>
              <div class="char-count">{{ processOpinion.length }}/500</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="dialog-footer">
        <button 
          type="button"
          class="btn btn-primary" 
          @click="handlePrimaryAction"
          :disabled="processing"
        >
          <span v-if="processing" class="loading-spinner"></span>
          {{ processing ? '处理中...' : getPrimaryActionText() }}
        </button>
        <button 
          type="button"
          class="btn btn-secondary" 
          @click="handleRejectReport"
          :disabled="processing"
        >
          <span v-if="processing" class="loading-spinner"></span>
          {{ processing ? '处理中...' : '驳回举报' }}
        </button>
        <button 
          type="button"
          class="btn btn-cancel" 
          @click="handleCancel"
          :disabled="processing"
        >
          取消
        </button>
      </div>
    </div>
  </div>
  
  <!-- 头像悬停预览弹窗 -->
  <Teleport to="body">
    <div 
      v-if="showPreview && reportData?.avatarUrl" 
      class="avatar-hover-preview"
      :style="previewPosition"
    >
      <div class="preview-content">
        <img 
          :src="reportData.avatarUrl" 
          class="preview-avatar"
          @error="handlePreviewImageError"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

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
  },
  // 处理状态
  processing: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'primary-action', 'reject-report', 'cancel']);

// 响应式数据
const processOpinion = ref('');
const showValidation = ref(false);
const showPreview = ref(false);
const previewPosition = ref({});
const avatarRef = ref(null);
let previewTimer = null;



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

// 获取主要操作按钮文本
const getPrimaryActionText = () => {
  const actions = {
    POST: '封禁帖子',
    COMMENT: '封禁评论',
    USER: '封禁用户'
  };
  return actions[props.violationType] || '封禁内容';
};

// 处理主要操作
const handlePrimaryAction = () => {
  showValidation.value = true;
  if (!processOpinion.value.trim()) {
    return;
  }
  emit('primary-action', processOpinion.value.trim());
};

// 处理驳回举报
const handleRejectReport = () => {
  showValidation.value = true;
  if (!processOpinion.value.trim()) {
    return;
  }
  emit('reject-report', processOpinion.value.trim());
};

// 处理取消操作
const handleCancel = () => {
  processOpinion.value = '';
  showValidation.value = false;
  emit('cancel');
  visible.value = false;
};

// 监听弹窗状态，重置表单
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    processOpinion.value = '';
    showValidation.value = false;
  } else {
    // 弹窗关闭时清理预览状态
    hideAvatarPreview();
  }
});

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (!props.processing) {
    handleCancel();
  }
};

// 头像加载失败处理
const handleAvatarError = (event) => {
  event.target.style.display = 'none';
  const defaultAvatar = event.target.nextElementSibling;
  if (defaultAvatar) {
    defaultAvatar.style.display = 'flex';
  }
};

// 显示头像预览
const showAvatarPreview = (event) => {
  if (!props.reportData?.avatarUrl) return;
  
  // 计算预览弹窗位置
  const rect = event.target.getBoundingClientRect();
  const previewWidth = 200;
  const previewHeight = 200;
  
  // 默认显示在右侧
  let left = rect.right + 10;
  let top = rect.top;
  
  // 如果右侧空间不够，显示在左侧
  if (left + previewWidth > window.innerWidth) {
    left = rect.left - previewWidth - 10;
  }
  
  // 如果下方空间不够，向上调整
  if (top + previewHeight > window.innerHeight) {
    top = window.innerHeight - previewHeight - 10;
  }
  
  // 确保不超出屏幕顶部
  if (top < 10) {
    top = 10;
  }
  
  previewPosition.value = {
    left: `${left}px`,
    top: `${top}px`
  };
  
  // 延迟显示，避免误触
  previewTimer = setTimeout(() => {
    showPreview.value = true;
  }, 200);
};

// 隐藏头像预览
const hideAvatarPreview = () => {
  if (previewTimer) {
    clearTimeout(previewTimer);
    previewTimer = null;
  }
  showPreview.value = false;
};

// 预览图片加载失败处理
const handlePreviewImageError = () => {
  hideAvatarPreview();
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
  padding: 0;
  background: white;
  flex: 1;
  overflow-y: auto;
}

/* 内容区域样式 */
.content-section {
  padding: 24px;
}

.content-section:first-child {
  padding-top: 24px;
}

.content-section:last-child {
  padding-bottom: 24px;
}

/* 区域标题 */
.section-header {
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  letter-spacing: -0.2px;
}

/* 分隔线 */
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
  margin: 0 24px;
}

/* 信息行样式 */
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
  min-width: 80px;
  flex-shrink: 0;
}

.value {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

/* 用户信息区域样式 */
.user-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar-container {
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-container[data-has-preview="true"]:hover {
  transform: scale(1.08);
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e9ecef;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  border-color: #ff4500;
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
}

.default-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 22px;
  color: white;
  border: 3px solid #e9ecef;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 内容文本区域 */
.content-text {
  margin-top: 16px;
}

.content-value {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  line-height: 1.6;
}



/* 头像悬停预览弹窗 */
.avatar-hover-preview {
  position: fixed;
  width: 200px;
  z-index: 9999;
  pointer-events: none;
  animation: fadeInScale 0.2s ease;
}

.preview-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.preview-avatar {
  width: 168px;
  height: 168px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  border: 2px solid #e9ecef;
}

/* 动画效果 */
@keyframes fadeInScale {
  from { 
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}



/* 必填标记样式 */
.required {
  color: #ff4757;
  font-weight: normal;
  margin-left: 4px;
}

/* 表单组样式 */
.form-group {
  margin-top: 16px;
  position: relative;
}

/* 处理意见输入框样式 */
.process-opinion-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: #fafafa;
}

.process-opinion-input:focus {
  outline: none;
  border-color: #ff4500;
  box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.1);
  background: white;
}

.process-opinion-input.error {
  border-color: #ff4757;
  box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
  background: #fff5f5;
}

.process-opinion-input::placeholder {
  color: #adb5bd;
}

/* 错误提示样式 */
.error-message {
  color: #ff4757;
  font-size: 13px;
  margin-top: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 字符计数样式 */
.char-count {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 12px;
  color: #6c757d;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #FF4500;
  color: white;
  border-color: #FF4500;
}

.btn-primary:hover:not(:disabled) {
  background: #E63E00;
  border-color: #E63E00;
}

.btn-secondary {
  background: #0079D3;
  color: white;
  border-color: #0079D3;
}

.btn-secondary:hover:not(:disabled) {
  background: #0056A3;
  border-color: #0056A3;
}

.btn-cancel {
  background: white;
  color: #6c757d;
  border-color: #dee2e6;
}

.btn-cancel:hover:not(:disabled) {
  background: #f8f9fa;
  color: #495057;
  border-color: #adb5bd;
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
  .dialog-container {
    width: 95%;
    margin: 16px;
  }
  
  .dialog-header {
    padding: 16px 20px;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .section-divider {
    margin: 0 16px;
  }
  
  .dialog-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 8px;
  }
  
  .btn {
    width: 100%;
  }
  
  /* 用户信息响应式 */
  .user-info {
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
  
  .user-details {
    align-items: center;
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
  }
  
  /* 表单响应式 */
  .process-opinion-input {
    padding: 12px;
    min-height: 100px;
  }
  
  .char-count {
    bottom: 8px;
    right: 12px;
  }
  
  /* 头像预览弹窗响应式 */
  .avatar-hover-preview {
    width: 180px;
  }
  
  .preview-content {
    padding: 12px;
  }
  
  .preview-avatar {
    width: 156px;
    height: 156px;
  }
}
</style> 