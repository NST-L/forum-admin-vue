<template>
  <div class="category-management">
    <el-card>
      <div class="header">
        <el-input v-model="searchForm.category_name" placeholder="搜索分类名称" style="width: 200px; margin-right: 10px;" @keyup.enter.native="fetchCategories" />
        <el-button type="primary" @click="fetchCategories">搜索</el-button>
        <el-button type="success" @click="openAddDialog" style="margin-left: 10px;">新增分类</el-button>
      </div>
      <el-table :data="categories" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="categoryName" label="分类名称" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="!searchForm.fetch_all"
        style="margin-top: 20px; text-align: right;"
        background
        layout="prev, pager, next, jumper"
        :total="total"
        :page-size="searchForm.page_size"
        :current-page="searchForm.page_num"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="dialogForm" :rules="rules" ref="dialogFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="dialogForm.categoryName" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCategoryList, addCategory, updateCategory, deleteCategory } from '@/api/categoryManagement';

const categories = ref([]);
const total = ref(0);
const searchForm = reactive({
  category_name: '',
  page_num: 1,
  page_size: 10,
  fetch_all: false
});

const dialogVisible = ref(false);
const dialogForm = reactive({
  id: null,
  categoryName: ''
});
const dialogTitle = ref('');
const dialogFormRef = ref(null);

const rules = {
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
};

function fetchCategories() {
  getCategoryList(searchForm).then(res => {
    if (res.data.code === 200) {
      categories.value = res.data.data.list;
      total.value = res.data.data.total;
    } else {
      ElMessage.error(res.data.msg || '获取分类失败');
    }
  });
}

function openAddDialog() {
  dialogTitle.value = '新增分类';
  dialogForm.id = null;
  dialogForm.categoryName = '';
  dialogVisible.value = true;
}

function openEditDialog(row) {
  dialogTitle.value = '编辑分类';
  dialogForm.id = row.id;
  dialogForm.categoryName = row.categoryName;
  dialogVisible.value = true;
}

function handleDialogConfirm() {
  dialogFormRef.value.validate(valid => {
    if (!valid) return;
    if (dialogForm.id) {
      // 编辑
      updateCategory({
        id: dialogForm.id,
        categoryName: dialogForm.categoryName
      }).then(res => {
        if (res.data.code === 200) {
          ElMessage.success('编辑成功');
          dialogVisible.value = false;
          fetchCategories();
        } else {
          ElMessage.error(res.data.msg || '编辑失败');
        }
      });
    } else {
      // 新增
      addCategory({
        categoryName: dialogForm.categoryName
      }).then(res => {
        if (res.data.code === 200) {
          ElMessage.success('新增成功');
          dialogVisible.value = false;
          fetchCategories();
        } else {
          ElMessage.error(res.data.msg || '新增失败');
        }
      });
    }
  });
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    type: 'warning'
  }).then(() => {
    deleteCategory({ id: row.id, categoryName: row.categoryName }).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('删除成功');
        fetchCategories();
      } else {
        ElMessage.error(res.data.msg || '删除失败');
      }
    });
  });
}

function handlePageChange(page) {
  searchForm.page_num = page;
  fetchCategories();
}

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-management {
  padding: 24px;
  background: #fff;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style> 