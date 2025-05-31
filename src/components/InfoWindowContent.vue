<template>
  <div class="info-content">
    <div class="info-row">
      <span class="info-label">行政区：</span>
      <span class="info-value">{{ name }}</span>
    </div>
    <div class="info-row">
      <span class="info-label">贴子数：</span>
      <span class="info-value">{{ value }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  name: String,
  value: [String, Number]
});
</script>

<style scoped>
.info-content {
  background-color: #DAE0E6;
  min-width: 100px;
  max-width: 220px;
  border-radius: 6px;
  padding: 12px 15px;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
  font-family: 'Segoe UI', 'Open Sans', 'Helvetica Neue', sans-serif;
}
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  line-height: 1.5;
}
.info-row:last-child {
  margin-bottom: 0;
}
.info-label {
  color: #666666;
  font-weight: 400;
  flex: 0 0 60px;
}
.info-value {
  color: #1A1A1B;
  font-weight: 500;
  flex: 1;
}
</style> 