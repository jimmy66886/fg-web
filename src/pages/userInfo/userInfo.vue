<template>
  <view class="userInfo">
    <view class="userBasicInfo">
      <image :src="userInfo.avatarUrl" mode="aspectFill"></image>
      <view>{{ userInfo.nickName }}</view>
    </view>
    <view class="other">
      <view v-if="userInfo.createTime">{{ userInfo.createTime.split('-')[0] }}&nbsp;&nbsp;加入
      </view>
      <view>bio:&nbsp;&nbsp;&nbsp;{{ userInfo.bio }}</view>
    </view>

    <view class="fff">
      <view class="ff">
        <view>{{ followList.length }}</view>
        <view>关注</view>
      </view>
      <view class="ff">
        <view>{{ fans.length }}</view>
        <view>粉丝</view>
      </view>
      <view @tap="followCtrl(true)" v-if="!isAuthor && isFollowed == false" class="follow">关注</view>
      <view @tap="followCtrl(false)" v-if="!isAuthor && isFollowed == true" class="follow">已关注</view>
    </view>

    <view class="line"></view>

    <!-- 搜索结果展示区 -->
    <view style="font-size: 40rpx; margin-bottom: 10rpx;">ta的菜谱</view>
    <view v-for="item in recipeList" :key="item.recipeId">
      <view @tap="toRecipeInfo(item.recipeId)" class="recipeItem">
        <image :src="item.imageUrl" mode="aspectFill" />
        <view class="basicInfo">
          <view style="font-size: 40rpx; font-weight: bold;">{{ item.title }}</view>
          <!-- 浏览量和收藏量以及点赞量放到一行 -->
          <view class="otherInfo">
            <view>{{ item.views }}看过</view>
            <view>{{ item.favoriteNumber }}收藏</view>
            <view>{{ item.likeNumber }}赞过</view>
          </view>
          <view style="font-size: 30rpx; color: gray;">{{ item.nickName }}</view>
        </view>
      </view>
    </view>
    <view v-if="recipeList.length === 0" style="text-align: center;">
      <text>暂无数据</text>
    </view>

  </view>
</template>

<script lang="ts" setup>

import emitter from '@/utils/emitter';
import user from '@/service/user';
import recipe from '@/service/recipe';
import { ref } from 'vue'
import follow from '@/service/follow';

const { getById, get } = user()
const { getByRecipeId, getByUserId } = recipe()
const { getFollowed, addFollow, deleteFollow, getFollowList, getFans } = follow()

let userInfo = ref({
  avatarUrl: '',
  nickName: '',
  userId: 0
})

let recipeList = ref([])
let followList = ref([])
let fans = ref([])


let isAuthor = ref(false)
let isFollowed = ref(false)

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

const followCtrl = async (ctrl: boolean) => {
  if (ctrl) {
    const res = await addFollow(userInfo.value.userId)
    isFollowed.value = true
  } else {
    uni.showModal({
      title: '提示',
      content: '确认取消关注',
      showCancel: true,
      success: async ({ confirm, cancel }) => {
        if (confirm) {
          const res = await deleteFollow(userInfo.value.userId)
          isFollowed.value = false
        }
      }
    })
  }
}


function init() {
  uni.getStorage({
    key: 'authorId',
    success: async ({ data }) => {
      console.log('要去获取用户:', data)
      // 先获取用户基本信息
      const res = await getById(data)
      console.log('res:', res.data)
      userInfo.value = res.data
      // 再获取用户的菜谱列表
      const recipeRes = await getByUserId(data)
      console.log(recipeRes.data)
      recipeList.value = recipeRes.data

      // 判断是不是本人
      const userRes = await get()
      if (userRes.data.userId === data) {
        isAuthor.value = true
      }


      // 获取该用户的粉丝列表和关注列表
      const followListRes = await getFollowList(data)
      followList.value = followListRes.data
      const fansRes = await getFans(data)
      fans.value = fansRes.data

      // 判断是否关注了对方
      const followRes = await getFollowed(data)
      isFollowed.value = followRes.data
      uni.hideLoading()
    },
    fail: (error) => { }
  })
}

init()

</script>

<style scoped>
.ff {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 100rpx;
}

.fff {
  display: flex;
  position: relative;
  margin-top: 50rpx;
}

.fff .follow {
  position: absolute;
  right: 0;
  width: 150rpx;
  height: 80rpx;
  background-color: #5DB298;
  line-height: 80rpx;
  text-align: center;
  color: white;
  border-radius: 10rpx;
}

.line {
  height: 1px;
  background-color: #ccc;
  margin: 0 auto;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.userInfo {
  margin: 100rpx 37.5rpx;
}

.userBasicInfo {
  display: flex;
  position: relative;
  align-items: center;
  margin-bottom: 100rpx;
}

.userBasicInfo image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 75rpx;
}

.userBasicInfo view {
  position: absolute;
  right: 0rpx;
  font-size: 40rpx;
}

/* =================== */

.basicInfo {
  /* 用于将介绍信息垂直分开 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.recipeItem {
  /* 用于将图片和介绍信息水平分成两份 */
  display: flex;
  margin-bottom: 30rpx;
}

.recipeItem image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  margin-right: 30rpx;
}

.otherInfo {
  /* 用于将点赞,收藏,浏览量水平分开 */
  display: flex;
  width: 350rpx;
  font-size: 30rpx;
  color: rgb(43, 41, 41);
  justify-content: space-between;
}

/* ========================== */
</style>