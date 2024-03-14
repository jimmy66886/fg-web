<template>
  <view>
    <view class="mainCategory" v-for="item in mainCategory" :key="item.mainCategoryId">
      <view>{{ item.name }}</view>
      <!-- 大类下的分类 -->
      <view class="categoryBox">
        <view class="categoryItem" @tap="toSearchPage(i.name)" :style="{ 'background-image': `url(${i.img})` }"
          v-for="i in item.categoryList" :key="i.name">
          <view class="categoryName">
            {{ i.name }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>

// 引入接口函数
import category from '@/service/category';
import { ref } from 'vue'

// 获取接口函数
const { getAllCategory } = category()

// 大类数组
let mainCategory = ref([])

const getAllCategoryData = async () => {
  const res = await getAllCategory()
  console.log(res.data)
  mainCategory.value = res.data
}

function toSearchPage(name: string) {
  console.log(name)

  // 跳转
  uni.setStorage({
    key: 'searchCondition',
    data: name,
  })
  uni.navigateTo({
    url: '/pages/search/search',
  })
}

getAllCategoryData()

</script>

<style scoped>
.mainCategory {
  margin: 10rpx 37.5rpx;
  font-size: 40rpx;
  font-weight: bold;
  margin-top: 50rpx;
}

.categoryBox {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.categoryItem {
  width: 200rpx;
  height: 200rpx;
  font-size: 35rpx;
  margin-right: 10rpx;
  background-size: cover;
  text-align: center;
  border-radius: 20rpx;
  margin-bottom: 37.5rpx;
}

.categoryName {
  border-radius: 20rpx;
  line-height: 80rpx;
  width: 200rpx;
  height: 80rpx;
  color: white;
  font-weight: 400;
  margin-top: 120rpx;
  backdrop-filter: blur(7px);
}
</style>