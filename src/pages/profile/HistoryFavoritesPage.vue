<template>
  <div class="page-grid">
    <n-grid cols="12" x-gap="16" y-gap="16">
      <n-gi :span="8">
        <n-card title="历史调研记录">
          <n-data-table :columns="columns" :data="tasks" />
        </n-card>
      </n-gi>
      <n-gi :span="4">
        <n-card title="收藏与筛选">
          <div class="filter-section">
            <n-input v-model:value="search" placeholder="搜索任务" />
            <n-select v-model:value="typeFilter" :options="filters" placeholder="对象类型筛选" />
            <n-button block type="primary" @click="refresh">刷新列表</n-button>
          </div>
        </n-card>
      </n-gi>
    </n-grid>
    <n-card title="收藏项示例">
      <div class="favorite-card">
        <div>
          <h4>已收藏：行业判研报告</h4>
          <n-tag type="success">已收藏</n-tag>
        </div>
        <n-button type="primary">继续调研</n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue';
import { NCard, NDataTable, NButton, NTag, NGrid, NGi, NInput, NSelect } from 'naive-ui';
import { mockTasks } from '../../api/mock';

const search = ref('');
const typeFilter = ref('');
const tasks = ref(mockTasks);

const filters = [
  { label: '全部', value: '' },
  { label: '公司', value: 'company' },
  { label: '股票', value: 'stock' },
  { label: '商品', value: 'product' },
];

const columns = [
  { title: '任务名称', key: 'title' },
  { title: '对象类型', key: 'objectType' },
  { title: '状态', key: 'status' },
  { title: '调研时间', key: 'requestedAt' },
  {
    title: '操作',
    key: 'actions',
    render: () => h(NButton, { size: 'small' }, { default: () => '查看' }),
  },
];

function refresh() {
  tasks.value = mockTasks;
}
</script>

<style scoped>
.page-grid {
  display: grid;
  gap: 24px;
}

.filter-section {
  display: grid;
  gap: 16px;
}

.favorite-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
</style>
