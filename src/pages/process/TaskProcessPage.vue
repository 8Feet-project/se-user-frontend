<template>
  <div class="page-grid">
    <n-card title="调研过程监控">
      <n-timeline>
        <n-timeline-item title="任务已提交" status="success">
          系统已开始读取调研配置，准备 DeepSearch 检索。
        </n-timeline-item>
        <n-timeline-item title="深度检索进行中" status="processing">
          当前正在抓取多源信息，已完成 42%。
        </n-timeline-item>
        <n-timeline-item title="智能分析中" status="pending">
          继续调用大模型完成语义整合与结论提炼。
        </n-timeline-item>
      </n-timeline>
    </n-card>
    <n-card title="当前分析状态">
      <div class="status-grid">
        <n-tag type="success">正在拆解问题</n-tag>
        <n-tag type="info">正在阅读第 3 篇文献</n-tag>
        <n-tag type="warning">等待模型结果</n-tag>
      </div>
      <n-descriptions :column="2" label-placement="left">
        <n-descriptions-item label="对象类型">公司</n-descriptions-item>
        <n-descriptions-item label="优先模型">DeepSearch Pro</n-descriptions-item>
        <n-descriptions-item label="开始时间">2026-03-31 09:25</n-descriptions-item>
        <n-descriptions-item label="任务进度">42%</n-descriptions-item>
      </n-descriptions>
      <n-button type="primary" secondary>查看详情</n-button>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NCard, NTimeline, NTimelineItem, NTag, NDescriptions, NDescriptionsItem, NButton } from 'naive-ui';
</script>

<style scoped>
.page-grid {
  display: grid;
  gap: 24px;
}

.status-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
</style>
