<template>
  <view class="main">
    <view class="materialsBox">
      <view class="materialItem" :key="item" v-for="item in selectedMaterials">{{ item }}</view>
    </view>

    <!-- 搜索结果展示区 -->
    <view class="result" v-for="item in recipeList" :key="item.recipeId">
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

    <button class="reSelect" @tap="reSelect">重新选菜</button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import recipe from '@/service/recipe';

let recipeList = ref()

const { getByRecipeId, getByMaterials } = recipe()

let selectedMaterials = ref([])

function reSelect() {
  uni.switchTab({ url: '/pages/material/material' })
}

const getByMaterialsData = async () => {
  const res = await getByMaterials(selectedMaterials.value)
  recipeList.value = res.data
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


/**
 * 从本地获取数据的,一定要将初始化的数据放到success中调用,不然很可能调用失败,为空数据
 */

onLoad(() => {
  // 先把食材列表取出
  uni.getStorage({
    'key': 'selectedMaterials',
    success: (res) => {
      selectedMaterials.value = JSON.parse(res.data)
      getByMaterialsData()
    },
  })
})



</script>

<style scoped>
.materialsBox {
  display: flex;
  overflow-x: scroll;
  white-space: nowrap;
}

.materialsBox::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.materialItem {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: white;
  color: black;
  border-radius: 40rpx;
  margin-bottom: 10rpx;
  background-color: #e9e7e7;
  margin-right: 15rpx;
  /* 不指定每个食材的宽度,用字来撑开,然后在字的左右加上边距 */
  padding-left: 22rpx;
  padding-right: 22rpx;

}

.main {
  margin: 10rpx 37.5rpx;
}

.reSelect {
  background-color: #E0F0EB;
  position: fixed;
  bottom: 40rpx;
  left: 70rpx;
  right: 70rpx;
  color: #5DB298;
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

.basicInfo {
  /* 用于将介绍信息垂直分开 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>