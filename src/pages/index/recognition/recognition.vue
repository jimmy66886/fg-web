<template>
  <view v-if="recognitionResult">
    <view class="recognition">您是否要找:{{ recognitionResult.title }}</view>
    <view v-if="recognitionResult.pageResult.records.length > 0" class="result"
      v-for="item in recognitionResult.pageResult.records" :key="item.recipeId">
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
    <view style="text-align: center;" v-else>暂无数据</view>
    <view class="bottom">-- 到底了 --</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import recipe from '@/service/recipe';

const { getByRecipeId } = recipe()
let recognitionResult = ref({
  pageResult: {},
  title: ''
})

const toRecipeInfo = async (recipeId: number) => {
  console.log(recipeId)
  // 先根据recipeId获取到菜谱的详细信息，然后将该详细信息发送给recipe组件，再跳转
  const res = await getByRecipeId(recipeId)
  console.log('结果是：', res)
  // 直接存入本地存储吧
  uni.setStorage({
    key: 'recipe',
    data: JSON.stringify(res.data)
  })
  uni.navigateTo({ url: '/pages/recipe/recipe' })
}


onLoad(() => {
  // 获取本地存储中的缓存数据
  uni.getStorage({
    key: 'recognitionResult',
    success: ({ data }) => {
      recognitionResult.value = JSON.parse(data).data
      console.log('@@!@#!', recognitionResult.value)
    },
    fail: (error) => { }
  })
})

</script>

<style scoped>
.bottom {
  text-align: center;
  color: gray;
}


.recognition {
  margin: 20rpx 37.5rpx;
  font-size: 40rpx;
}

.result {
  margin: 10rpx 37.5rpx;
}

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
</style>