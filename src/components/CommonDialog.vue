<template>
  <!-- 遮罩层 -->
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <!-- 对话框容器 -->
    <div class="dialog-container" @click.stop>
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <h3 class="dialog-title">{{ title }}</h3>
        <button class="dialog-close" @click="handleCancel" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 对话框主体 -->
      <div class="dialog-body">
        <form class="dialog-form" @submit.prevent="handleConfirm">
          <div class="form-group">
            <label class="form-label" :for="fieldName">{{ fieldLabel }}</label>
            <input 
              :id="fieldName"
              v-model="form[fieldName]" 
              class="form-input"
              :class="{ 'error': fieldError }"
              :placeholder="`请输入${fieldLabel}`"
              @blur="validateField"
              @input="clearError"
              type="text"
            />
            <span v-if="fieldError" class="error-message">{{ fieldError }}</span>
          </div>
        </form>
      </div>

      <!-- 对话框底部 -->
      <div class="dialog-footer">
        <button 
          type="button"
          class="btn btn-primary" 
          @click="handleConfirm"
          :disabled="!isFormValid"
        >
          确定
        </button>
        <button 
          type="button"
          class="btn btn-cancel" 
          @click="handleCancel"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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
    default: '操作'
  },
  // 表单数据
  formData: {
    type: Object,
    default: () => ({})
  },
  // 字段名称（用于v-model绑定）
  fieldName: {
    type: String,
    required: true
  },
  // 字段标签
  fieldLabel: {
    type: String,
    required: true
  },
  // 表单验证规则
  rules: {
    type: Object,
    default: () => ({})
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close']);

// 响应式数据
const form = ref({});
const fieldError = ref('');

// 计算属性：弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 计算属性：表单是否有效
const isFormValid = computed(() => {
  const value = form.value[props.fieldName];
  const hasValue = value && value.trim() !== '';
  const hasNoError = !fieldError.value;
  return hasValue && hasNoError;
});

// 监听表单数据变化，同步到内部form
watch(
  () => props.formData,
  (newData) => {
    form.value = { ...newData };
    fieldError.value = '';
  },
  { immediate: true, deep: true }
);

// 验证字段
const validateField = () => {
  const value = form.value[props.fieldName];
  const rules = props.rules[props.fieldName];
  
  if (!rules || !Array.isArray(rules)) {
    fieldError.value = '';
    return true;
  }

  for (const rule of rules) {
    // 必填验证
    if (rule.required && (!value || value.trim() === '')) {
      fieldError.value = rule.message || '此字段为必填项';
      return false;
    }

    // 长度验证
    if (value && rule.min && value.length < rule.min) {
      fieldError.value = rule.message || `最少需要${rule.min}个字符`;
      return false;
    }

    if (value && rule.max && value.length > rule.max) {
      fieldError.value = rule.message || `最多允许${rule.max}个字符`;
      return false;
    }
  }

  fieldError.value = '';
  return true;
};

// 清除错误
const clearError = () => {
  fieldError.value = '';
};

// 处理确认操作
const handleConfirm = () => {
  if (validateField() && isFormValid.value) {
    emit('confirm', form.value);
  }
};

// 处理取消操作
const handleCancel = () => {
  emit('cancel');
  visible.value = false;
};

// 处理遮罩层点击
const handleOverlayClick = () => {
  handleCancel();
};

// 处理关闭操作
const handleClose = () => {
  emit('close');
};

// 重置表单
const resetForm = () => {
  form.value = { ...props.formData };
  fieldError.value = '';
};

// 暴露方法给父组件
defineExpose({
  resetForm
});
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
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  width: 90%;
  max-width: 480px;
  height: auto; /* 改为自适应高度 */
  min-height: auto; /* 移除最小高度限制 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 对话框头部 */
.dialog-header {
  background: linear-gradient(90deg, #ff4500, #ff6b35); /* 添加从左到右的橙色渐变 */
  color: white;
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px; /* 设置固定高度 */
  box-sizing: border-box;
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.3px;
}

.dialog-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.dialog-close:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

/* 对话框主体 */
.dialog-body {
  padding: var(--spacing-lg) var(--spacing-xl); /* 减少上下内边距 */
  background: var(--card-bg);
  flex: 1; /* 让主体部分占据剩余空间 */
}

/* 表单样式 */
.dialog-form {
  margin: 0;
}

.form-group {
  margin-bottom: var(--spacing-md); /* 减少表单组间距 */
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--foreground-color);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.2px;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  color: var(--foreground-color);
  background: var(--card-bg);
  box-sizing: border-box;
  font-weight: 500;
}

.form-input:hover {
  border-color: var(--primary-color);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.1);
}

.form-input.error {
  border-color: #ff4757;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
}

.error-message {
  display: block;
  margin-top: var(--spacing-xs);
  color: #ff4757;
  font-size: 12px;
  font-weight: 500;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: center; /* 按钮居中 */
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl); /* 增加上下内边距以匹配头部高度 */
  background: #f8f9fa;
  border-top: 1px solid var(--border-color);
  height: 60px; /* 设置与头部相同的固定高度 */
  box-sizing: border-box;
  align-items: center; /* 垂直居中按钮 */
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
  height: 36px; /* 设置固定按钮高度 */
  display: flex;
  align-items: center;
  justify-content: center;
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
    margin: var(--spacing-lg);
  }
  
  .dialog-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .dialog-body {
    padding: var(--spacing-lg);
  }
  
  .dialog-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    flex-direction: column; /* 移动端保持确定按钮在上方 */
  }
  
  .btn {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
  
  .btn:last-child {
    margin-bottom: 0;
  }
}
</style> 