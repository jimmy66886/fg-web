<template>
  <view class="message">
    <view class="title">
      <image @tap="back" class="back" src="http://47.109.139.173:9000/food.guide/fanhui返回.png" mode="aspectFill" />
      <view class="center">消息</view>
    </view>
    <!-- 赞与收藏，评论，新增粉丝 -->
    <view class="ctrlList">
      <view @tap="changeIndex(1)" class="item">
        <image src="http://47.109.139.173:9000/food.guide/zanyushoucang.png" mode="aspectFill" />
        <view :class="{ activeIndex: activeIndex === 1 }">赞与收藏</view>
      </view>
      <view @tap="changeIndex(2)" class="item">
        <image src="http://47.109.139.173:9000/food.guide/评论annniu.png" mode="aspectFill" />
        <view :class="{ activeIndex: activeIndex === 2 }">评论</view>
      </view>
      <view @tap="changeIndex(3)" class="item">
        <image src="http://47.109.139.173:9000/food.guide/xizneng粉丝.png" mode="aspectFill" />
        <view :class="{ activeIndex: activeIndex === 3 }">新增粉丝</view>
      </view>
    </view>
    <!-- 下面显示的内容就是上面选择的东西，默认是赞与收藏，那么怎么判断用户选择的是哪一个呢? -->
    <view class="report" v-if="activeIndex === 1">通知列表</view>
    <view class="report" v-if="activeIndex === 2">评论</view>
    <view class="report" v-if="activeIndex === 3">新增粉丝列表</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

let activeIndex = ref(1)

function back() {
  uni.navigateBack({ delta: 1 })
}

function changeIndex(index) {
  activeIndex.value = index
}

</script>

<style scoped>
.activeIndex {
  padding-bottom: 10rpx;
  border-bottom: 10rpx solid #5DB298;
}

.report {
  margin: 100rpx 37.5rpx;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item image {
  width: 80rpx;
  height: 80rpx;
}

.ctrlList {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 50rpx 37.5rpx;
}

.title {
  margin-top: 110rpx;
}

.back {
  width: 60rpx;
  height: 60rpx;
  position: fixed;
  left: 37.5rpx;
  top: 105rpx;
}

.title .center {
  text-align: center;
}
</style>