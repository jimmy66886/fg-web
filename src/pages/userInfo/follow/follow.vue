<template>
  <view class="follow">

    <view v-if="resultList.length" class="resultItem" v-for="item in resultList" :key="item.userId">
      <image :src="item.avatarUrl" mode="aspectFill" />
      <view>{{ item.nickName }}</view>
      <view class="followButton">关注按钮</view>
    </view>
    <view v-else style="text-align: center; margin-top: 100rpx;">
      这里是空的哦~
    </view>

  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import user from '@/service/user';

const { get } = user()

let resultList = ref([])

onLoad(async () => {

  let nickName = ''
  const res = await get()
  nickName = res.data.nickName

  uni.getStorage({
    key: 'fans',
    success: ({ data }) => {
      resultList.value = JSON.parse(data)
      uni.setNavigationBarTitle({
        title: nickName + '的粉丝'
      })
    },
    fail: (error) => { }
  })

  uni.getStorage({
    key: 'followList',
    success: ({ data }) => {
      resultList.value = JSON.parse(data)
      uni.setNavigationBarTitle({
        title: nickName + '的关注'
      })
    },
    fail: (error) => { }
  })
})
</script>

<style scoped>
.resultItem {
  display: flex;
  align-items: center;
  position: relative;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #ccc;
}

.resultItem .followButton {
  border: 1rpx solid #5DB298;
  width: 160rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  position: absolute;
  right: 0;
  border-radius: 20rpx;
}

.resultItem image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  margin-right: 20rpx;
}

.follow {
  margin: 10rpx 37.5rpx;
}
</style>