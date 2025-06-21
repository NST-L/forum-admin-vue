<template>
  <div class="category-management">
    <h1 class="page-title">分类管理</h1>
    
    <div class="search-filter">
      <div class="filter-bar">
        <input class="input" v-model="searchForm.category_name" placeholder="搜索分类名称" @input="handleSearch" />
        <button class="add-btn" @click="openAddDialog">
          <i class="fas fa-plus"></i>
          新增分类
        </button>
      </div>
    </div>
    <div class="table-container">
      <table class="user-table card-style">
        <thead>
          <tr>
            <th>ID</th>
            <th>分类名称</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody v-if="categories.length > 0">
          <tr v-for="category in categories" :key="category.categoryId">
            <td>{{ category.categoryId }}</td>
            <td>{{ category.categoryName }}</td>
            <td>
              <button class="status-btn" @click="openEditDialog(category)">编辑</button>
              <button class="status-btn disable" @click="handleDelete(category)">删除</button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="3">
              <div class="empty-container">
                <i class="fas fa-info-circle empty-icon"></i>
                <p class="empty-tip">暂无分类数据</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination left-align">
      <button @click="handlePageChange(searchForm.page_num - 1)" :disabled="searchForm.page_num <= 1" class="page-btn">上一页</button>
      <span class="page-info">第 {{ searchForm.page_num }} 页 / 共 {{ totalPages }} 页 (总计 {{ total }} 条记录)</span>
      <button @click="handlePageChange(searchForm.page_num + 1)" :disabled="searchForm.page_num >= totalPages" class="page-btn">下一页</button>
    </div>

    <!-- 新增/编辑分类对话框 -->
    <CommonDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="dialogForm"
      :rules="rules"
      field-name="categoryName"
      field-label="分类名称"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
      ref="dialogRef"
    />

    <!-- 删除确认弹窗 -->
    <DeleteConfirmDialog
      v-model="deleteDialogVisible"
      title="提示"
      :message="`确定要删除分类「${currentDeleteCategory?.categoryName}」吗？`"
      :loading="deleteLoading"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getCategoryList, addCategory, updateCategory, deleteCategory } from '@/api/categoryManagement';
import CommonDialog from '@/components/CommonDialog.vue';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue';

const categories = ref([]);
const total = ref(0);
const totalPages = ref(1);  // 使用后端返回的页数，不再计算
const searchForm = reactive({
  category_name: '',
  page_num: 1,
  page_size: 10
});

const dialogVisible = ref(false);
const dialogForm = reactive({
  categoryId: null,
  categoryName: ''
});
const dialogTitle = ref('');
const dialogRef = ref(null);

// 删除确认弹窗相关状态
const deleteDialogVisible = ref(false);
const deleteLoading = ref(false);
const currentDeleteCategory = ref(null);

const rules = {
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
};

function fetchCategories() {
  console.log('=== fetchCategories 开始 ===');
  console.log('请求参数:', JSON.stringify(searchForm, null, 2));
  
  // 确保分页参数有效
  const requestParams = {
    category_name: searchForm.category_name || '',
    page_num: searchForm.page_num || 1,
    page_size: searchForm.page_size || 10,
    fetch_all: false
  };
  
  console.log('实际发送的参数:', JSON.stringify(requestParams, null, 2));
  
  getCategoryList(requestParams).then(res => {
    console.log('=== API响应详情 ===');
    console.log('完整响应:', JSON.stringify(res, null, 2));
    
    if (res.data && res.data.success) {
      console.log('API调用成功');
      console.log('res.data.data:', JSON.stringify(res.data.data, null, 2));
      
      if (res.data.data && res.data.data.list) {
        console.log('数据列表存在');
        console.log('原始分类列表长度:', res.data.data.list.length);
        console.log('总数据量(total_count):', res.data.data.total_count);
        console.log('总页数(page_count):', res.data.data.page_count);
        
        categories.value = res.data.data.list;
        total.value = res.data.data.total_count || 0;
        totalPages.value = res.data.data.page_count || 1;
        
        console.log('=== 处理结果 ===');
        console.log('处理后的分类列表:', categories.value);
        console.log('当前页码:', searchForm.page_num);
        console.log('每页大小:', searchForm.page_size);
        console.log('总数据量:', total.value);
        console.log('后端返回的总页数:', totalPages.value);
        
        // 如果当前页没有数据且不是第一页，则跳转到第一页
        if (categories.value.length === 0 && searchForm.page_num > 1) {
          console.log('当前页无数据，跳转到第一页');
          searchForm.page_num = 1;
          fetchCategories();
          return;
        }
      } else {
        console.error('数据格式错误 - 缺少data.list字段');
        console.error('res.data.data:', res.data.data);
        categories.value = [];
        total.value = 0;
        totalPages.value = 1;
        ElMessage.error('数据格式错误');
      }
    } else {
      console.error('API调用失败');
      console.error('失败原因:', res.data?.message);
      categories.value = [];
      total.value = 0;
      totalPages.value = 1;
      ElMessage.error(res.data?.message || '获取分类失败');
    }
  }).catch(error => {
    console.error('=== 请求异常 ===');
    console.error('错误对象:', error);
    console.error('错误消息:', error.message);
    console.error('错误响应:', error.response);
    categories.value = [];
    total.value = 0;
    totalPages.value = 1;
    ElMessage.error('请求失败：' + (error.message || '未知错误'));
  });
  
  console.log('=== fetchCategories 结束 ===');
}

function openAddDialog() {
  dialogTitle.value = '新增分类';
  dialogForm.categoryId = null;
  dialogForm.categoryName = '';
  dialogVisible.value = true;
  if (dialogRef.value) {
    dialogRef.value.resetForm();
  }
}

function openEditDialog(row) {
  dialogTitle.value = '编辑分类';
  dialogForm.categoryId = row.categoryId;
  dialogForm.categoryName = row.categoryName;
  dialogVisible.value = true;
}

function handleDialogConfirm(formData) {
  if (formData.categoryId) {
    // 编辑
    updateCategory({
      category_id: formData.categoryId,
      category_name: formData.categoryName
    }).then(res => {
      if (res.data && (res.data.success || res.data.code === 200)) {
        ElMessage.success('编辑成功');
        dialogVisible.value = false;
        fetchCategories();
      } else {
        ElMessage.error(res.data?.message || '编辑失败');
      }
    }).catch(error => {
      ElMessage.error(error.response?.data?.message || '编辑失败，请稍后重试');
    });
  } else {
    // 新增
    addCategory({ category_name: formData.categoryName }).then(res => {
      if (res.data && res.data.success) {
        ElMessage.success('新增成功');
        dialogVisible.value = false;
        fetchCategories();
      } else {
        ElMessage.error(res.data?.message || '新增失败');
      }
    }).catch(error => {
      ElMessage.error(error.response?.data?.message || '新增失败，请稍后重试');
    });
  }
}

function handleDialogCancel() {
  dialogVisible.value = false;
}

function handleDelete(row) {
  currentDeleteCategory.value = row;
  deleteDialogVisible.value = true;
}

function handleDeleteConfirm() {
  if (!currentDeleteCategory.value) return;
  
  deleteLoading.value = true;
  deleteCategory(currentDeleteCategory.value.categoryId).then(res => {
    if (res.data && (res.data.success || res.data.code === 200)) {
      ElMessage.success('删除成功');
      deleteDialogVisible.value = false;
      
      // 如果删除后当前页没有数据了，且不是第一页，则跳转到上一页
      const currentPageItemCount = categories.value.length;
      if (currentPageItemCount === 1 && searchForm.page_num > 1) {
        searchForm.page_num = searchForm.page_num - 1;
      }
      
      fetchCategories();
    } else {
      ElMessage.error(res.data?.message || '删除失败');
    }
  }).catch(error => {
    ElMessage.error(error.response?.data?.message || '删除失败，请稍后重试');
  }).finally(() => {
    deleteLoading.value = false;
    currentDeleteCategory.value = null;
  });
}

function handleDeleteCancel() {
  deleteDialogVisible.value = false;
  currentDeleteCategory.value = null;
}

function handlePageChange(page) {
  console.log('=== handlePageChange 开始 ===');
  console.log('目标页码:', page, '当前页码:', searchForm.page_num, '总页数:', totalPages.value);
  
  // 基本边界检查
  if (page < 1 || page > totalPages.value || page === searchForm.page_num) {
    console.log('页码无效或重复，取消切换');
    return;
  }
  
  console.log('执行页码切换');
  searchForm.page_num = page;
  fetchCategories();
}

function handleSearch() {
  searchForm.page_num = 1;
  // 添加防抖延迟，避免频繁请求
  clearTimeout(window.categorySearchTimeout);
  window.categorySearchTimeout = setTimeout(() => {
    fetchCategories();
  }, 300);
}



onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>


.category-management {
  padding: 40px;
  background: #DAE0E6;
  min-height: 100vh;
}
.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 24px;
  margin-top: 0;
  color: #222;
  letter-spacing: 2px;
}
.search-filter {
  margin-bottom: 24px;
}
.filter-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.input {
  max-width: 190px;
  padding: 12px;
  border: none;
  border-radius: 4px;
  outline: none;
  color: dimgray;
}
.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
  background: #fff !important;
  border-radius: 12px;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}
.user-table th,
.user-table td {
  padding: 14px 20px;
  text-align: left;
  border-bottom: 1px solid #eee;
  background: transparent !important;
}
.user-table th {
  background-color: #e8ecf0;
  font-weight: 500;
  color: #333;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  text-align: center;
}
.user-table td {
  background-color: #fff;
  text-align: center;
}
.status-btn {
  padding: 8px 16px;
  margin-right: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  background-color: rgba(0, 121, 211, 0.1);
  color: #0079D3;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.2px;
}
.status-btn:hover {
  background-color: #0079D3;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 121, 211, 0.3);
}
.status-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.status-btn.disable {
  background-color: rgba(255, 69, 0, 0.1);
  color: #FF4500;
  border: none;
}
.status-btn.disable:hover {
  background-color: #FF4500;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 69, 0, 0.3);
}
/* 新增按钮现代化设计 */
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #FF4500 0%, #FF6B35 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.add-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.add-btn:hover::before {
  left: 100%;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 69, 0, 0.4);
  background: linear-gradient(135deg, #E63E00 0%, #FF4500 100%);
}

.add-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
}

.add-btn i {
  font-size: 12px;
  font-weight: bold;
}
.page-btn {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  letter-spacing: -0.2px;
}
.page-btn:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #FF4500;
  color: #FF4500;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 69, 0, 0.15);
}
.page-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.page-btn:disabled {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}
.page-info {
  font-size: 14px;
  color: #666;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.pagination.left-align {
  justify-content: flex-start;
}
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  background: #fff !important;
}
.empty-icon {
  font-size: 48px;
  color: #666;
  margin-bottom: 16px;
}
.empty-tip {
  font-size: 14px;
  color: #666;
}


</style> 