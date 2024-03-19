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

  <view class="bottom">-- 到底了 --</view>

  <view class="bottomButtons">
    <!-- 底部操作栏 -->
    <view @tap="manage" class="itemBox">
      <image src="http://47.109.139.173:9000/food.guide/%E6%95%B4%E7%90%862311.png" mode="aspectFill" />
      整理
    </view>
    <view class="itemBox">
      <image src="http://47.109.139.173:9000/food.guide/ADD.png" mode="aspectFill" />添加
    </view>
    <view class="itemBox">
      <image src="http://47.109.139.173:9000/food.guide/编辑1231.png" mode="aspectFill" />编辑
    </view>
    <view class="itemBox">
      <image src="http://47.109.139.173:9000/food.guide/分321享.png" mode="aspectFill" />分享
    </view>
  </view>
</template>

<!-- 整理这个功能,思路是这样的,首先设置一个变量,用于标识当前是否为整理状态,如果不是,则用户点击菜谱时,自动跳转至菜谱详情,如果是,则将该菜谱加入至选中列表中,并标识该菜谱 -->

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
let beginManage = ref(false)

function manage() {
  beginManage.value = true
}

let selectIfImg = ref('http://47.109.139.173:9000/food.guide/未选中.png')

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
.bottomButtons {
  display: flex;
  justify-content: space-between;
  position: fixed;
  bottom: 0rpx;
  text-align: center;
}

.bottomButtons view {
  line-height: 100rpx;
  width: 187.5rpx;
  height: 100rpx;
}

.bottomButtons image {
  width: 50rpx;
  height: 50rpx;
  margin-right: 2rpx;
}

.itemBox {
  display: flex;
  align-items: center;
  margin-left: 14rpx;
}

.bottom {
  text-align: center;
  color: gray;
}

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