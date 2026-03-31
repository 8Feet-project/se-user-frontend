<template>
  <div class="page-center">
    <n-card title="用户登录" style="width: 420px">
      <n-form>
        <n-form-item label="邮箱地址">
          <n-input v-model:value="email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="登录密码">
          <n-input type="password" v-model:value="password" placeholder="请输入密码" />
        </n-form-item>
        <n-form-item>
          <n-button block type="primary" @click="handleLogin">登录</n-button>
        </n-form-item>
      </n-form>
      <div class="page-footer">
        <span>没有账号？</span>
        <n-button tertiary @click="goRegister">注册</n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui';

const router = useRouter();
const email = ref('');
const password = ref('');

function handleLogin() {
  router.push('/');
}

function goRegister() {
  router.push('/register');
}
</script>

<style scoped>
.page-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
}

.page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}
</style>
