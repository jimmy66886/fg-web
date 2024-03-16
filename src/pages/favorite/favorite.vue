<template>
  <input class="search" placeholder="搜索我的收藏" />

  <view class="titleTab">
    <view :class="{ active: activeIndex === '1' }" @tap="change('1')">所有菜谱</view>
    <view :class="{ active: activeIndex === '2' }" @tap="change('2')">自定义收藏夹</view>
  </view>

  <view v-if="activeIndex === '1'" class="favorites">
    <!-- 搜索结果展示区 -->
    <view v-for="item in favoriteList" :key="item.recipeId">
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

  <view v-if="activeIndex === '2'" class="favorites">
    <view @tap="getFavoritesInfo(item.favoritesId)" class="favoritesItem" v-for="item in favorites"
      :key="item.favoritesId">
      <image :src="item.coverImg" mode="aspectFill" />
      <view>{{ item.name }}</view>
      <view>{{ item.number }}道菜谱</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import favorite from '@/service/favorite';
import { onShow } from '@dcloudio/uni-app';
import recipe from '@/service/recipe';
import { ref } from 'vue';

const { getByRecipeId } = recipe()
const { getAllFavorites, getAllFavorite, getById } = favorite()

let favorites = ref([])
let favoriteList = ref([])
let activeIndex = ref('2')

const getAllFavoritesData = async () => {
  const res = await getAllFavorites()
  favorites.value = res.data
}

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

const getAllFavoriteData = async () => {
  const res = await getAllFavorite()
  favoriteList.value = res.records
}

function change(index) {
  activeIndex.value = index
  if (index === '2') {
    getAllFavoritesData()
  } else {
    getAllFavoriteData()
  }
}


/**
 * 根据收藏夹id获取收藏夹里的菜谱
 */
function getFavoritesInfo(favoritesId: number) {
  // 思路错了,应该直接将收藏夹id传给recipeList界面,然后由recipeList界面自己去请求
  uni.setStorage({
    key: 'favoritesId',
    data: favoritesId,
    success: (result) => {
      // 成功后跳转
      uni.navigateTo({
        url: '/pages/favorite/recipeList/recipeList',
      })
    },
    fail: (error) => { }
  })
}

onShow(() => {
  getAllFavoritesData()
})

</script>

<style scoped>
.titleTab {
  display: flex;
  justify-content: space-around;
  line-height: 70rpx;
  height: 70rpx;
}

.favorites {
  margin: 20rpx 30rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.favoritesItem {
  width: 330rpx;
  height: 400rpx;
  margin-bottom: 30rpx;
  border-radius: 30rpx;
}

.favoritesItem image {
  width: 330rpx;
  height: 330rpx;
  border-radius: 30rpx;
}

.search {
  margin: 10rpx 37.5rpx;
}

.active {
  color: green;
  border-bottom: 6rpx solid green;
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