<template>
  <div class="page-grid">
    <n-card title="报告预览与导出">
      <div class="toolbar">
        <div class="toolbar-title">报告概览</div>
        <div class="toolbar-actions">
          <n-button secondary>导出 Markdown</n-button>
          <n-button secondary>导出 PDF</n-button>
          <n-button secondary>导出 Word</n-button>
        </div>
      </div>
      <n-tabs v-model:value="activeTab">
        <n-tab name="brief" tab="简版报告">
          <div class="report-panel">
            <h4>核心结论</h4>
            <p>本次调研汇总了公司资质、行业地位和市场动态，并给出智能化成长期判断。</p>
          </div>
        </n-tab>
        <n-tab name="detail" tab="详版报告">
          <div class="report-panel">
            <h4>详细分析</h4>
            <p>1. 公司基本面：核心业务、营收结构与竞争优势。</p>
            <p>2. 行业动态：当前市场热点、政策影响与行业风险。</p>
            <p>3. 结论与建议：基于多模型对比的综合判断。</p>
          </div>
        </n-tab>
        <n-tab name="source" tab="引用来源">
          <div class="report-panel">
            <h4>信息来源</h4>
            <n-tag type="info">来源 1：官方公告</n-tag>
            <n-divider />
            <n-tag type="info">来源 2：行业研究报告</n-tag>
            <n-divider />
            <n-tag type="info">来源 3：新闻舆情</n-tag>
          </div>
        </n-tab>
      </n-tabs>
    </n-card>
    <n-card title="段落追问" style="min-height: 220px">
      <p>选择报告段落并输入问题，系统将基于当前上下文给出补充说明。</p>
      <n-button type="primary">开始追问</n-button>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NButton, NTabs, NTab, NTag, NDivider } from 'naive-ui';

const activeTab = ref('brief');
</script>

<style scoped>
.page-grid {
  display: grid;
  gap: 24px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.report-panel {
  padding: 16px 0;
}
</style>
