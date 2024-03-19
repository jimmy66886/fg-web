<template>
  <view v-if="topComment" class="commentBox">
    <!-- 头像,昵称,日期,点赞这四部分内容 -->
    <view class="andl">
      <image :src="topComment.senderAvatarUrl" mode="aspectFill" />
      <view>
        <view>{{ topComment.senderName }} <text style="margin-left: 10rpx; color: green;" v-if="topIsAuthor">作者</text></view>
        <view>{{ topComment.sendDateTime.split(' ')[0] }}</view>
      </view>
      <view class="like">点赞</view>
    </view>
    <!-- 评论内容 -->
    <view class="content">{{ topComment.content }}</view>
  </view>
  <view class="commentList" v-if="commentList">
    <view style="margin-bottom: 40rpx;">共{{ commentList.length }}条回复</view>
    <view v-for="item in commentList">
      <view class="andl">
        <image :src="item.senderAvatarUrl" mode="aspectFill" />
        <view>
          <view>{{ item.senderName }}<text style="margin-left: 10rpx; color: green;" v-if="item.isAuthor">作者</text></view>
          <view>{{ item.sendDateTime.split(' ')[0] }}</view>
        </view>
        <view class="like">点赞</view>
      </view>
      <!-- 评论内容 -->
      <view class="content">{{ item.content }}</view>
    </view>
  </view>

</template>

<script lang="ts" setup>
import { onLoad, onReady } from '@dcloudio/uni-app';
import { ref } from 'vue';

let topComment = ref()
let commentList = ref([])

let topIsAuthor = ref(false)
// let isAuthor = ref(false)

// 如何判断评论用户是否是作者?可以在页面加载时,从本地存储中取出recipe,将评论id与作者id相比对,如果一样,则在昵称旁边加上<作者>

onLoad(() => {
  uni.getStorage({
    key: 'topComment',
    success: ({ data }) => {
      topComment.value = JSON.parse(data)
      uni.getStorage({
        key: 'recipe',
        success: ({ data }) => {
          if (topComment.value.senderId === JSON.parse(data).authorId) {
            // 是作者,则将一个变量设置为true
            topIsAuthor.value = true
          }
        },
        fail: (error) => { }
      })
    },
    fail: (error) => { }
  })

  uni.getStorage({
    key: 'commentList',
    success: ({ data }) => {
      commentList.value = JSON.parse(data)
      uni.setNavigationBarTitle({ title: '共' + commentList.value.length + '条回复' })

      // 判断当前评论用户是否是作者
      uni.getStorage({
        key: 'recipe',
        success: ({ data }) => {
          for (let index = 0; index < commentList.value.length; index++) {
            if (JSON.parse(data).authorId === commentList.value[index].senderId) {
              // 给这一项的isAuthor直接赋值为true(虽然原本数组上并没有这个值,但是这么写应该也没问题)
              commentList.value[index].isAuthor = true
            }
          }
        },
        fail: (error) => { }
      })
    },
    fail: (error) => { }
  })
})

</script>

<style scoped>
.commentList {
  margin: 0 37.5rpx;
}

.andl {
  display: flex;
  position: relative;
  color: grey;
}

.like {
  position: absolute;
  right: 37.5rpx;
}

.content {
  margin-left: 80rpx;
  font-size: 40rpx;
}

.andl image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
}

.commentBox {
  margin: 50rpx 37.5rpx;
}
</style>