<template>
  <view class="content">
    <view>有食做</view>
    <view>搜索框</view>
    <view>一言</view>
    <view>常用分类模块</view>
  </view>
  <!-- 下面就是菜谱列表 -->
  <view class="recipeList">
    <view class="recipeItem" v-for="item in recipeList" :key="item.recipeId">
      <image @tap="toRecipeInfo(item.recipeId)" :src="item.imageUrl" mode="scaleToFill" />
      <view>{{ item.title }}</view>
      <!-- <view>{{ item.nickName }}</view> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import recipe from '@/service/recipe'
import { onLoad } from '@dcloudio/uni-app';

const { getRecipeList, getByRecipeId } = recipe()

const recipeList = ref([])

const getRecipeListData = async () => {
  console.log('开始分页获取菜谱列表')
  const res = await getRecipeList()
  recipeList.value = res.records
}

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
  // 初始化数据
  getRecipeListData()
})

</script>

<style scoped>
.recipeList {
  /* background-color: #999999; */
  display: flex;
  flex-wrap: wrap;
}

.recipeItem {
  width: 50%;
  border: 5px solid rgb(255, 255, 255);
  overflow: hidden;
  box-sizing: border-box;
  font-size: 36rpx;
  font-weight: 400;
}

.recipeItem image {
  width: 340rpx;
  height: 340rpx;
  border-radius: 18px;
}
</style>
