<template>
  <view v-if="recipeStep.length > 0" class="stepItem" v-for="(item, index) in recipeStep">
    <image @tap="deleteOne(index)" class="delete" src="http://47.109.139.173:9000/food.guide/132删除.png"
      mode="scaleToFill" />
    <view>
      <view>步骤{{ item.stepNumber }}</view>
      <view class="imageAndContent">
        <image :src="item.img" mode="aspectFill" />
        <!-- 只能显示13个字,多余的会导致样式混乱,所以直接截取13个字显示得了,或者12个,然后加省略号 -->
        <view>{{ item.content.length > 13 ? item.content.slice(0, 12) + '...' : item.content }}</view>
      </view>
    </view>
  </view>
  <button @tap="save" class="finished">完成</button>
</template>

<script lang="ts" setup>

import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import emitter from '@/utils/emitter';

let recipeStep = ref([])

function deleteOne(index: number) {
  // 删除指定项
  recipeStep.value.splice(index, 1)
  // 将后面的序号全部减一
  if (index !== (recipeStep.value.length)) {
    console.log('开始更新序号')
    // 说明删除的不是最后一项,则将该索引后面的stepNumber减一
    for (index; index < recipeStep.value.length; index++) {
      recipeStep.value[index].stepNumber -= 1
    }
  }
}

function save() {
  // 将修改后的调料数组返回
  uni.setStorage({
    key: 'recipeStep',
    data: JSON.stringify(recipeStep.value),
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
    key: 'recipeStep',
    success: (res) => {
      recipeStep.value = JSON.parse(res.data)
      console.log('@', recipeStep.value)
    },
    fail: (error) => { }
  })
})

</script>

<style scoped>
.finished {
  margin: 80rpx 37.5rpx;
}

.stepItem {
  display: flex;
  margin: 0 37.5rpx;
  align-items: center;
  justify-content: left;
  margin-bottom: 20rpx;
}

.delete {
  width: 50rpx;
  height: 50rpx;
  margin-right: 20rpx;
}

.imageAndContent {
  display: flex;
  line-height: 150rpx;
}

.imageAndContent image {
  width: 150rpx;
  height: 150rpx;
}

.imageAndContent view {
  padding-left: 30rpx;
}
</style>