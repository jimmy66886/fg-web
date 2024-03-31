<template>
  <view class="searchBox">
    <image @tap="back" class="back" src="http://47.109.139.173:9000/food.guide/fanhui返回.png" mode="aspectFill" />
    <input placeholder="搜索好友" type="text" v-model.trim="nickName">
    <view :class="{ disabled: !nickName }" @tap="search">查询</view>
  </view>
  <view v-if="userList.length" class="resultItem" v-for="(item, index) in userList" :key="item.userId">
    <image @tap="toUserInfo(item.userId)" :src="item.avatarUrl" mode="aspectFill" />
    <view @tap="toUserInfo(item.userId)">{{ item.nickName }}</view>
    <view v-if="item.isFollowed" @tap="followCtrl(false, index)" class="followButton">已关注</view>
    <view v-else class="followButton" @tap="followCtrl(true, index)">关注</view>
  </view>
  <view class="showMessage" v-if="showMessage">无匹配用户,请换个条件吧</view>
</template>

<script lang="ts" setup>

import user from '@/service/user';
import follow from '@/service/follow'
import { ref } from 'vue';
const { searchByNickName } = user()
const { addFollow, deleteFollow } = follow()

let nickName = ref('')
let userList = ref([])
let showMessage = ref(false)

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

function back() {
  uni.navigateBack({ delta: 1 })
}

const followCtrl = async (ctrl: Boolean, index: number) => {
  if (ctrl) {
    const res = await addFollow(userList.value[index].userId)
    userList.value[index].isFollowed = true
  } else {
    uni.showModal({
      title: '提示',
      content: '确认取消关注?',
      showCancel: true,
      success: async ({ confirm, cancel }) => {
        if (confirm) {
          const res = await deleteFollow(userList.value[index].userId)
          userList.value[index].isFollowed = false
        }
      }
    })
  }
}

const search = async () => {
  uni.showLoading({
    title: '加载中',
    mask: true
  })
  if (nickName.value === '') {
    uni.showToast({
      title: '搜索内容不能为空',
      icon: 'error',
      mask: true
    })
    return
  }

  const res = await searchByNickName(nickName.value)
  console.log('查询结果为:', res.data)
  userList.value = res.data
  if (userList.value.length === 0) {
    showMessage.value = true
  } else {
    showMessage.value = false
  }
  uni.hideLoading()
}

</script>

<style scoped>
.showMessage {
  margin-top: 100rpx;
  text-align: center;
  font-size: 35rpx;
}

.resultItem {
  display: flex;
  align-items: center;
  position: relative;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #ccc;
  margin: 10rpx 37.5rpx;
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

.disabled {
  color: grey;
}

.searchBox {
  display: flex;
  justify-content: space-between;
  margin: 0 37.5rpx;
  margin-top: 200rpx;
  align-items: center;
}

.back {
  width: 60rpx;
  height: 60rpx;
}

input {
  border-radius: 40rpx;
  height: 80rpx;
  width: 500rpx;
  background-color: #f8f8f8;
  padding-left: 20rpx;
}
</style>