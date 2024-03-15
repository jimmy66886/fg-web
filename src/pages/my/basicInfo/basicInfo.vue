<template>
  <input placeholder="请输入昵称" type="nickname" />
  <button open-type="chooseAvatar">上传头像</button>
  <image v-if="avatarUrl" :src="avatarUrl" mode="aspectFit"></image>
</template>

<script lang="ts" setup>
import { ref } from 'vue';


let avatarUrl = ref('')

</script>

<style scoped></style>