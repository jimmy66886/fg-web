<template>
  <button @click="open" class="materialsButton">用料</button>
  <uni-popup ref="popup" background-color="#fff" type="bottom" border-radius="10px 10px 0 0">
    <view class="materialsBox">
      <view style="font-size: 40rpx; margin-left: 37.5rpx; margin-top: 50rpx;">用料</view>
      <view class="materialsList" v-for="item in materialsList" :key="item.materialsId">
        <view class="materialsItem">
          <text>{{ item.name }}</text>
          <text class="materialsAmount">{{ item.amount }}</text>
        </view>
      </view>
    </view>
    <view style="height: 400rpx;"></view>
  </uni-popup>


  <view v-if="recipeStepList" class="cookingMode">

    <view class="stepItem" v-for="item in recipeStepList" :key="item.recipeStepId">
      <view class="stepTitle">步骤{{ item.stepNumber }}<text style="color: grey;">/{{ recipeStepList.length }}</text>
      </view>
      <image @tap="previewImage(item.stepNumber)" :src="item.img" mode="aspectFill" />
      <view class="stepContent">{{ item.content }}</view>
    </view>

  </view>

  <view class="bottomBox"></view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

let recipeStepList = ref([])
let materialsList = ref([])

function getRecipeStepList() {
  uni.getStorage({
    key: 'recipe',
    success: ({ data }) => {
      recipeStepList.value = JSON.parse(data).recipeStepList
      recipeStepList.value.sort((a: { stepNumber: number; }, b: { stepNumber: number; }) => a.stepNumber - b.stepNumber)
      materialsList.value = JSON.parse(data).materialsList
    },
    fail: (error) => { }
  })
}

let popup = ref()

function open() {
  // 通过组件定义的ref调用uni-popup方法 ,如果传入参数 ，type 属性将失效 ，仅支持 ['top','left','bottom','right','center']
  popup.value.open('bottom')
}

function previewImage(stepNumber: number) {
  console.log(stepNumber)
  // 将这个步骤集合中的图片提取出一个图片地址数组
  let imgArr: any[] = []
  recipeStepList.value.forEach((element: { img: string; }) => {
    imgArr.push(element.img)
  });
  uni.previewImage({
    current: stepNumber - 1,
    urls: imgArr
  })
}

getRecipeStepList()

</script>

<style scoped>

.materialsButton{
}

.materialsAmount {
  position: absolute;
  right: 100rpx;
}

.materialsItem {
  height: 80rpx;
  line-height: 80rpx;
  border-bottom: 1rpx solid #ccc;
}

.materialsList {
  margin-left: 37.5rpx;
  margin-right: 37.5rpx;
  position: relative;
}

.bottomBox {
  width: 100%;
  height: 150rpx;
}

.stepItem {
  margin-bottom: 50rpx;
}

.stepContent {
  font-size: 45rpx;
}

.stepTitle {
  font-size: 50rpx;
}

.cookingMode image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 30rpx;
}

.cookingMode {
  margin: 50rpx 37.5rpx;
}
</style>