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
        <view :class="{ activeIndex: activeIndex === 1 }">收到的赞</view>
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
    <view class="report" v-if="activeIndex === 1">
      <view class="likeItem" v-if="newLikes.length" v-for="item in newLikes">
        <image @tap="toUserInfo(item.userId)" :src="item.avatarUrl" mode="aspectFill" />
        <view @tap="toRecipeInfo(item.recipeId)" class="likeBasic">
          <view>{{ item.nickName }}</view>
          <view v-if="item.likeType === 'recipe'">点赞了你的菜谱</view>
          <view v-else>点赞了你的评论</view>
          <view style="font-size: 25rpx; color: grey;">{{ item.createTime }}</view>
        </view>
        <view @tap="toRecipeInfo(item.recipeId)" class="likeContent">
          {{ truncateText(item.content) }}
        </view>
      </view>
      <view v-else>
        <view style="text-align: center">数据为空</view>
      </view>
    </view>
    <view class="report" v-if="activeIndex === 2">
      <view class="commentItem" v-if="newComments.length" v-for="item in newComments" :key="item.commentId">
        <image @tap="toUserInfo(item.senderId)" :src="item.senderAvatarUrl" mode="aspectFill" />
        <view @tap="toCommentInfo(item.commentId, item.recipeId)" class="commentBasic">
          <view style="font-size: 30rpx;"><text style="font-weight: bold;">{{ item.senderName }}</text> <text
              style="color: #ccc;"> 回复了我的评论</text></view>
          <view>{{ cutCommentLength(item.content) }}</view>
          <view style="font-size: 25rpx; color: grey;">{{ item.sendDateTime }}</view>
        </view>
        <!-- 如果有原始评论，则显示原始评论 -->
        <view @tap="toCommentInfo(item.commentId, item.recipeId)" class="originalContent" v-if="item.originalContent">{{
        truncateText(item.originalContent) }}</view>
        <!-- 如果没有，则显示菜谱标题 -->
        <view @tap="toCommentInfo(item.commentId, item.recipeId)" class="originalContent" v-else>{{
        truncateText(item.title) }}</view>
      </view>
      <view v-else>
        <view style="text-align: center">数据为空</view>
      </view>
    </view>
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
      <view v-else>
        <view style="text-align: center">数据为空</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import follow from '@/service/follow';
import dateTools from '@/utils/dateTools'
import comment from '@/service/comment';
import recipe from '@/service/recipe';
import likes from '@/service/likes';
import { onLoad } from '@dcloudio/uni-app';

const { timeFormate } = dateTools()
const { getNewFans, addFollow, deleteFollow } = follow()
const { getNewComment } = comment()
const { getByRecipeId } = recipe()
const { getLikes } = likes()

let newFans = ref([])
let newComments = ref([])
let newLikes = ref([])

let activeIndex = ref(1)

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

function toCommentInfo(commentId: number, recipeId: number) {
  // 由于comment并不是一个页面，而是一个vue组件，所以没办法使用路由传参
  uni.setStorage({
    key: 'turnCommentId',
    data: commentId,
    success: async (result) => {
      // 跳转到评论界面

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
    },
    fail: (error) => { }
  })
}

function truncateText(text: string) {
  // 如果文本长度大于8，则截取前8个字符并添加省略号
  if (text.length > 8) {
    return text.substring(0, 8) + '...';
  }
  return text;
}

function cutCommentLength(text: string) {
  if (text.length > 23) {
    return text.substring(0, 23) + '...';
  }
  return text;
}

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
    uni.hideLoading()
  }
  if (index === 2) {
    const res = await getNewComment()
    newComments.value = res.data
    uni.hideLoading()
    /**
     * 评论这个地方需要改之前的评论结构，因为涉及到要跳转到指定的地方，所以是比较难搞的
     */
  }
  if (index === 1) {
    // 查询收到的赞
    const res = await getLikes()
    console.log('收到的赞列表：', res.data)
    newLikes.value = res.data
    uni.hideLoading()
  }
}

// 初始数据为收到的赞
onLoad(async () => {
  const res = await getLikes()
  console.log('收到的赞列表：', res.data)
  newLikes.value = res.data
})

</script>

<style scoped>
.likeItem {
  display: flex;
  position: relative;
  height: 120rpx;
  margin-top: 30rpx;
}

.likeItem image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  margin-right: 10rpx;
}

.likeBasic {
  height: 100rpx;
  width: 400rpx;
}

.likeItem .likeContent {
  width: 100rpx;
  position: absolute;
  right: 0;
  height: 100rpx;
  color: #ccc;
}

.commentItem {
  display: flex;
  position: relative;
  height: 90px;
}

.commentItem image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  margin-right: 10rpx;
}

.commentBasic {
  height: 100rpx;
  width: 400rpx;
}

.originalContent {
  width: 100rpx;
  position: absolute;
  right: 0;
  height: 100rpx;
  color: #ccc;
}

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