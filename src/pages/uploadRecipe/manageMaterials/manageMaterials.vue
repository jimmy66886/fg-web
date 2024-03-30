<template>
  <view class="manageMaterials">
    <view v-if="materials.length > 0" class="item" v-for="(item, index) in materials">
      <image src="http://47.109.139.173:9000/food.guide/132删除.png" @tap="deleteOne(index)" mode="scaleToFill" />
      <view>{{ item.name }}</view>
      <view class="amount">{{ item.amount }}</view>
    </view>
    <view v-else>暂无数据</view>
  </view>
  <button @tap="save" class="finished">完成</button>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

let materials = ref([])

function deleteOne(index: number) {
  // 根据数组下标删除数组元素
  materials.value.splice(index, 1)
}

function save() {
  // 将修改后的调料数组返回
  uni.setStorage({
    key: 'materials',
    data: JSON.stringify(materials.value),
    success: (result) => {
      // 跳转回去
      uni.navigateBack({ delta: 1 })
    },
    fail: (error) => { }
  })
}

onLoad(() => {
  // 取到传递过来的材料列表
  uni.getStorage({
    key: 'materials',
    success: (res) => {
      materials.value = JSON.parse(res.data)
      console.log('@', materials.value)
    },
    fail: (error) => { }
  })
})

</script>

<style scoped>
.finished {
  margin: 0 37.5rpx;
}

.manageMaterials {
  margin-top: 50rpx;
  margin-bottom: 100rpx;
}

.item .amount{
  position: absolute;
  right: 20rpx;
}

.item {
  height: 100rpx;
  display: flex;
  margin: 0 37.5rpx;
  position: relative;
}

.item image {
  width: 50rpx;
  height: 50rpx;
  margin-right: 150rpx;
}
</style>