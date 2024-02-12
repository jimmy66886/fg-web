<template>


  <button @tap="login">点击登录</button>

  <!-- <view class="my">
    <view>用户信息:{{ userStore.profile }}</view>
    <button @tap="userStore.setProfile({
      nickName: '灼灼某人', token: '12345'
    })" size="mini" plain type="primary">保存用户信息</button>
    <button @tap="userStore.clearProfile()" size="mini" plain type="primary">清除用户信息</button>
    <button @tap="getData">测试请求</button>
  </view> -->
  <!-- <view v-for="r in recipeList" :key="r.id">
    <view>标题:{{ r.title }}</view>
    <view>简介:{{ r.intro }}</view>
  </view> -->
</template>

<script lang="ts" setup>

import { useUserStore } from '@/stores'
import { http } from '@/utils/http'
import { reactive } from 'vue';
const userStore = useUserStore()

let recipeList: any = reactive([])

async function getData() {
  const res = await http<string[]>({
    method: 'GET',
    url: '/recipe/test'
  })
  console.log(res)
  // 将返回结果赋值给recipeList
  Object.assign(recipeList,res.data)
}

function login() {
  uni.navigateTo({ url: '/pages/login/login' })
}

</script>

<style scoped></style>