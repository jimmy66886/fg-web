<template>
  <view v-if="recipe">
    <img class="coverImg" :src="recipe.imageUrl">
    <view class="title">{{ recipe.title }}</view>
    <view class="otherInfo">
      <text>点赞数:{{ recipe.favoriteNumber }}</text>
      <text>浏览量:{{ recipe.views }}</text>
    </view>
    <view class="line"></view>
    <!-- 用户信息 -->
    <view class="userInfo">
      <img class="avatar" :src="recipe.avatarUrl">
      <text>{{ recipe.nickName }}</text>
      <button>关注</button>
    </view>
    <view class="line"></view>
    <!-- 用料 -->
    <view>
      <view class="materialsTitle">
        <text>用料</text>
        <button>丢进菜篮子</button>
      </view>
    </view>
    <view class="line"></view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

let recipe = ref()
getRecipe()

function getRecipe() {
  console.log('正在获取菜谱信息')
  uni.getStorage({
    'key': 'recipe',
    success: (res) => {
      recipe.value = JSON.parse(res.data)
      uni.setNavigationBarTitle({
        title: recipe.value.title
      })
    },
  })
}
</script>

<style scoped>
.materialsTitle {
  height: 80rpx;
  display: flex;
  margin-left: 75rpx;
  position: relative;
  font-size: 20px;
  line-height: 80rpx;
}

.materialsTitle button{
  position: absolute;
  right: 75rpx;
}

.userInfo {
  display: flex;
  width: 100%;
  height: 100rpx;
  justify-content: left;
  line-height: 100rpx;
  position: relative;
}

.userInfo text {
  font-size: large;
}

.userInfo button {
  position: absolute;
  right: 75rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-left: 75rpx;
  margin-right: 30rpx;
}

.coverImg {
  width: 750rpx;
  height: 750rpx;
}

.title {
  text-align: center;
  font-size: 30px;
}

.otherInfo {
  text-align: center;
  display: flex;
  margin-top: 10px;
  justify-content: space-around;
}

.line {
  width: 80%;
  height: 1px;
  background-color: #ccc;
  margin: 0 auto;
  margin-top: 50rpx;
  margin-bottom: 50rpx;
}
</style>