<template>
  <view class="content">
    <view>有食做</view>
    <view>搜索框</view>
    <view>一言</view>
    <view>常用分类模块</view>
    <!-- 下面就是菜谱列表 -->
    <view v-for="item in recipeList" :key="item.recipeId">
      <view>{{ item.nickName }}</view>
      <image :src="item.imageUrl" mode="scaleToFill" />
      <view>{{ item.title }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import recipe from '@/service/recipe'
import { onLoad } from '@dcloudio/uni-app';

const { getRecipeList } = recipe()

const recipeList = ref([])

const getRecipeListData = async () => {
  console.log('开始分页获取菜谱列表')
  const res = await getRecipeList()
  recipeList.value = res.records
}

onLoad(() => {
  // 初始化数据
  getRecipeListData()
})

</script>

<style></style>
