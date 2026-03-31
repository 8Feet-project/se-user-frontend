<template>
  <n-layout style="min-height: 100vh">
    <n-layout-header class="header-bar">
      <div class="brand">8Feet 深度调研平台</div>
      <n-space>
        <n-menu
          mode="horizontal"
          :options="navItems"
          :value="activeRoute"
          @update:value="onMenuChange"
        />
        <n-button secondary @click="logout">退出</n-button>
      </n-space>
    </n-layout-header>
    <n-layout-content class="content-area">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NLayout, NLayoutHeader, NLayoutContent, NMenu, NButton, NSpace } from 'naive-ui';

const router = useRouter();
const route = useRoute();

const navItems = [
  { label: '调研任务', key: '/' },
  { label: '调研过程', key: '/process' },
  { label: '报告中心', key: '/report' },
  { label: '历史收藏', key: '/history' },
];

const activeRoute = computed(() => (route.path === '/' ? '/' : route.path));

function onMenuChange(value: string) {
  router.push(value);
}

function logout() {
  router.push('/login');
}
</script>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #0e1a2b;
}

.brand {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}

.content-area {
  padding: 24px 32px;
  background: #f4f6fb;
}
</style>
