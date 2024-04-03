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
    <view class="report" v-if="activeIndex === 3">
      <view v-if="newFans.length" class="resultItem" v-for="(item, index) in newFans" :key="item.userId">
        <image @tap="toUserInfo(item.userId)" :src="item.avatarUrl" mode="aspectFill" />
        <view @tap="toUserInfo(item.userId)">
          <view>{{ item.nickName }}</view>
          <view style="font-size: 25rpx; margin-top: 5rpx;">关注了你 <text style="color: grey;">{{ item.createTime }}</text>
          </view>
        </view>
        <view v-if="item.isFollowed" @tap="followCtrl(false, index)" class="followButton">已关注</view>
        <view v-else class="followButton" @tap="followCtrl(true, index)">关注</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import follow from '@/service/follow';
import dateTools from '@/utils/dateTools'

const { timeFormate } = dateTools()
const { getNewFans, addFollow, deleteFollow } = follow()

let newFans = ref([])

let activeIndex = ref(1)

const followCtrl = async (ctrl: Boolean, index: number) => {
  if (ctrl) {
    const res = await addFollow(newFans.value[index].userId)
    newFans.value[index].isFollowed = true
  } else {
    uni.showModal({
      title: '提示',
      content: '确认取消关注?',
      showCancel: true,
      success: async ({ confirm, cancel }) => {
        if (confirm) {
          const res = await deleteFollow(newFans.value[index].userId)
          newFans.value[index].isFollowed = false
        }
      }
    })
  }
}

function back() {
  uni.navigateBack({ delta: 1 })
}

function toUserInfo(authorId: number) {
  uni.showLoading({
    title: '加载中',
    mask: true
  })
  setTimeout(() => {
    uni.setStorage({
      key: 'authorId',
      data: authorId,
      success: (result) => {
        uni.navigateTo({ url: '/pages/userInfo/userInfo' })
      },
      fail: (error) => { }
    })
  }, 500);

}

const changeIndex = async (index) => {
  activeIndex.value = index
  uni.showLoading({
    title: '加载中',
    mask: true
  })
  if (index === 3) {
    // 展示新增粉丝
    const res = await getNewFans()
    newFans.value = res.data
    newFans.value.forEach(item => {
      item.createTime = timeFormate(item.createTime)
    })
  }
  uni.hideLoading()
}

</script>

<style scoped>
.resultItem {
  display: flex;
  align-items: center;
  position: relative;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #ccc;
  margin: 10rpx 0;
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