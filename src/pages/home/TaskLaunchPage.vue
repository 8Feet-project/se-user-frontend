<template>
  <n-grid x-gap="24" y-gap="24" cols="12">
    <n-gi :span="8">
      <n-card title="发起调研任务" style="min-height: 540px">
        <n-form>
          <n-form-item label="商业对象名称">
            <n-input v-model:value="objectName" placeholder="请输入公司/股票/商品名称" />
          </n-form-item>
          <n-form-item label="对象类型">
            <n-select v-model:value="objectType" :options="objectTypes" />
          </n-form-item>
          <n-form-item label="时间范围">
            <n-select v-model:value="range" :options="rangeOptions" />
          </n-form-item>
          <n-form-item label="优先模型">
            <n-select v-model:value="model" :options="modelOptions" />
          </n-form-item>
          <n-form-item>
            <n-button block type="primary" @click="startResearch">开始调研</n-button>
          </n-form-item>
        </n-form>
      </n-card>
    </n-gi>
    <n-gi :span="4">
      <n-card title="快速说明" style="min-height: 540px">
        <div class="tip-section">
          <n-tag type="success">深度检索</n-tag>
          <p>通过 DeepSearch 自动抓取多源信息，并完成去重与语义整合。</p>
        </div>
        <div class="tip-section">
          <n-tag type="info">多模型分析</n-tag>
          <p>支持选择大模型进行多视角分析，生成结构化调研报告。</p>
        </div>
        <div class="tip-section">
          <n-tag type="warning">报告导出</n-tag>
          <p>支持 Markdown、PDF、Word 导出，便于分享与复用。</p>
        </div>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NCard, NForm, NFormItem, NInput, NSelect, NButton, NTag, NGrid, NGi } from 'naive-ui';

const router = useRouter();
const objectName = ref('');
const objectType = ref('company');
const range = ref('1_month');
const model = ref('deepsearch-pro');

const objectTypes = [
  { label: '公司', value: 'company' },
  { label: '股票', value: 'stock' },
  { label: '商品', value: 'product' },
];

const rangeOptions = [
  { label: '最近 1 个月', value: '1_month' },
  { label: '最近 3 个月', value: '3_months' },
  { label: '最近 1 年', value: '1_year' },
];

const modelOptions = [
  { label: 'DeepSearch Pro', value: 'deepsearch-pro' },
  { label: 'MarketInsight-X', value: 'marketinsight-x' },
  { label: 'FinanceGPT', value: 'financegpt' },
];

function startResearch() {
  router.push('/process');
}
</script>

<style scoped>
.tip-section {
  margin-bottom: 24px;
}

.tip-section p {
  margin: 12px 0 0;
  color: #4b566b;
  line-height: 1.7;
}
</style>
