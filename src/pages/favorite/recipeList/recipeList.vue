<template>

  <view class="title" v-if="favoritesInfo">
    <view style="font-size: 50rpx;">{{ favoritesInfo.name }}</view>
    <view>{{ favoritesInfo.intro }}</view>
  </view>

  <view class="favorites">
    <!-- 搜索结果展示区 -->
    <view v-for="item in recipeList" :key="item.recipeId">
      <view @tap="toRecipeInfo(item.recipeId)" class="recipeItem">
        <image :src="item.imageUrl" mode="aspectFill" />
        <view class="basicInfo">
          <view style="font-size: 40rpx; font-weight: bold;">{{ item.title }}</view>
          <!-- 浏览量和收藏量以及点赞量放到一行 -->
          <view class="otherInfo">
            <view>{{ item.views }}看过</view>
            <view>{{ item.favoriteNumber }}收藏</view>
            <view>{{ item.likeNumber }}赞过</view>
          </view>
          <view style="font-size: 30rpx; color: gray;">{{ item.nickName }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>

import { onLoad } from '@dcloudio/uni-app';
import recipe from '@/service/recipe';
import favorite from '@/service/favorite';
import { ref } from 'vue';
const { getByRecipeId } = recipe()
const { getById, getFavoritesInfo } = favorite()

let recipeList = ref([])
let favoritesInfo = ref()
let favoritesId = ref()

onLoad(() => {
  uni.getStorage({
    key: 'favoritesId',
    success: (res) => {
      favoritesId.value = res.data
      getRecipeListData(favoritesId.value)
      getFavoritesInfoData(favoritesId.value)
    },
    fail: (error) => { }
  })
})

const toRecipeInfo = async (recipeId: number) => {
  const res = await getByRecipeId(recipeId)
  uni.setStorage({
    key: 'recipe',
    data: JSON.stringify(res.data)
  })
  uni.navigateTo({
    url: '/pages/recipe/recipe',
  })
}

const getRecipeListData = async (favoritesId: number) => {
  const res = await getById(favoritesId)
  recipeList.value = res.data
}

// 还要获取收藏夹的信息
const getFavoritesInfoData = async (favoritesId: number) => {
  const res = await getFavoritesInfo(favoritesId)
  favoritesInfo.value = res.data
  uni.setNavigationBarTitle({
    title: favoritesInfo.value.name,
  })
}

</script>

<style scoped>
.title {
  margin: 60rpx 30rpx;
}

.favorites {
  margin: 20rpx 30rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

/* =================== */

.basicInfo {
  /* 用于将介绍信息垂直分开 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.recipeItem {
  /* 用于将图片和介绍信息水平分成两份 */
  display: flex;
  margin-bottom: 30rpx;
}

.recipeItem image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  margin-right: 30rpx;
}

.otherInfo {
  /* 用于将点赞,收藏,浏览量水平分开 */
  display: flex;
  width: 350rpx;
  font-size: 30rpx;
  color: rgb(43, 41, 41);
  justify-content: space-between;
}

/* ========================== */
</style>