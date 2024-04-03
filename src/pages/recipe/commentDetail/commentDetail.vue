<template>
  <view v-if="topComment" class="commentBox">
    <!-- 头像,昵称,日期,点赞这四部分内容 -->
    <view class="andl">
      <image @tap="toUserInfo(topComment.senderId)" class="avatar" :src="topComment.senderAvatarUrl"
        mode="aspectFill" />
      <view>
        <view @tap="toUserInfo(topComment.senderId)">{{ topComment.senderName }} <text
            style="margin-left: 10rpx; color: green;" v-if="topIsAuthor">作者</text>
        </view>
        <view>{{ topComment.sendDateTime.split(' ')[0] }}</view>
      </view>
      <view @tap="commentLikeCtrl(topComment.commentId, true)" v-if="!topComment.isLiked" class="like">
        <image class="likeButton" src="http://47.109.139.173:9000/food.guide/%E7%82%B9%E8%B5%9Eing.png"
          mode="aspectFill" />
        <view>
          {{ topComment.likeCount }}
        </view>
      </view>
      <view @tap="commentLikeCtrl(topComment.commentId, false)" v-if="topComment.isLiked" class="like">
        <image class="likeButton" src="http://47.109.139.173:9000/food.guide/%E7%82%B9%E8%B5%9Eed.png"
          mode="aspectFill" />
        <view>
          {{ topComment.likeCount }}
        </view>
      </view>
    </view>
    <!-- 评论内容 -->
    <view class="content" @tap="commentIt(topComment.commentId)">{{ topComment.content }}</view>
  </view>

  <!-- 该顶级评论下的二级评论 -->
  <view class="commentList" v-if="commentList">
    <view style="margin-bottom: 40rpx;">共{{ commentList.length }}条回复</view>
    <view class="commentListBox" v-for="item in commentList">
      <view class="andl">
        <image @tap="toUserInfo(item.senderId)" class="avatar" :src="item.senderAvatarUrl" mode="aspectFill" />
        <view>
          <view @tap="toUserInfo(item.senderId)">{{ item.senderName }}<text style="margin-left: 10rpx; color: green;"
              v-if="item.isAuthor">作者</text>
          </view>
          <view>{{ item.sendDateTime.split(' ')[0] }}</view>
        </view>

        <view @tap="commentLikeCtrl(item.commentId, true)" v-if="!item.isLiked" class="like">
          <image class="likeButton" src="http://47.109.139.173:9000/food.guide/%E7%82%B9%E8%B5%9Eing.png"
            mode="aspectFill" />
          <view>
            {{ item.likeCount }}
          </view>
        </view>
        <view @tap="commentLikeCtrl(item.commentId, false)" v-if="item.isLiked" class="like">
          <image class="likeButton" src="http://47.109.139.173:9000/food.guide/%E7%82%B9%E8%B5%9Eed.png"
            mode="aspectFill" />
          <view>
            {{ item.likeCount }}
          </view>
        </view>

        <!-- <view class="like">点赞</view>
        <view class="like">已赞</view> -->
      </view>
      <!-- 评论内容 -->
      <!-- 评论内容这个地方涉及到是否是回复二级评论,如果是回复二级评论,则一定有toId,就根据这个item是否存在toId,来限定评论内容的显示方式 -->
      <view v-if="!item.receiverId" @tap="commentIt(item.commentId, item.senderId)" class="content"
        @longpress="deleteThis(item.commentId, item.senderId)">{{
    item.content }}
      </view>
      <view v-else class="content" @tap="commentIt(item.commentId, item.senderId)" @longpress=" deleteThis(item.commentId,
    item.senderId)">回复 <text style="color: grey;">{{ item.receiverName }}</text> :
        {{ item.content }}</view>
    </view>
  </view>

</template>

<script lang="ts" setup>
import { onLoad, onReady } from '@dcloudio/uni-app';
import { ref } from 'vue';
import commentAPI from '@/service/comment';
import emitter from '@/utils/emitter';
import likes from '@/service/likes'
import user from '@/service/user';

const { addByCommentId, cancelCommentLike } = likes()
const { deleteComment, getByTopComment, add } = commentAPI()
const { get } = user()

let topComment = ref()
let commentList = ref([])

let reloadCommentList = ref(false)

let topIsAuthor = ref(false)
// let isAuthor = ref(false)


function toUserInfo(authorId: number) {
  console.log('要看的人:', authorId)
  uni.setStorage({
    key: 'authorId',
    data: authorId,
    success: (result) => {
      uni.navigateTo({ url: '/pages/userInfo/userInfo' })
    },
    fail: (error) => { }
  })
}

const commentLikeCtrl = async (commentId: number, ctrl: Boolean) => {
  if (ctrl) {
    console.log('进行点赞：', commentId)
    const res = await addByCommentId(commentId)
    commentList.value.forEach(item => {
      if (item.commentId === commentId) {
        item.isLiked = true
        item.likeCount++
      }
    })
    console.log('点赞成功')
  } else {
    console.log('取消点赞：', commentId)
    const res = await cancelCommentLike(commentId)
    commentList.value.forEach(item => {
      if (item.commentId === commentId) {
        item.isLiked = false
        item.likeCount--
      }
    })
    console.log('取消点赞成功')
  }
}

// 如何判断评论用户是否是作者?可以在页面加载时,从本地存储中取出recipe,将评论id与作者id相比对,如果一样,则在昵称旁边加上<作者>

/**
 * TODO 不好想啊这个,首先涉及到评论请求的发出问题,如果是要给顶级评论回复一条评论,则就不存在toId,comment只需要传入recipeId以及rootId和内容,如果是回复给顶级评论下的二级评论,还需要一个toId,这个toId就是方法接收的commentId
 * 那就涉及到如何判断这条评论是回复给谁的
 * 在评论时,肯定能获取到当前评论的id,再从本地存储中拿到顶级评论的id,做对比
 * @param commentId 要回复的评论id
 */
function commentIt(commentId: number, senderId: number) {
  uni.showModal({
    title: '评论',
    content: '',
    editable: true,
    confirmText: '发送',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {


        // 先判断是回复给顶级评论还是二级评论
        if (topComment.value.commentId === commentId) {
          console.log('是回复给顶级评论的')
          // 回复给顶级评论,就直接点,配上rootId就行了
          uni.getStorage({
            key: 'recipe',
            success: async ({ data }) => {
              let comment = {
                recipeId: JSON.parse(data).recipeId,
                rootId: commentId,
                content: res.content,
                // 添加回复的评论id，以及回复的用户id
                toCommentId: topComment.value.commentId,
                toUserId: topComment.value.userId
              }
              console.log('评论内容为：', comment)
              const result = await add(comment)
              // 更新评论信息
              updateList()
            },
            fail: (error) => { }
          })
        } else {
          console.log('不是回复给顶级评论的')
          // 那么要把toId赋值为要回复的二级评论的发起人的用户id
          uni.getStorage({
            key: 'recipe',
            success: async ({ data }) => {
              let comment = {
                recipeId: JSON.parse(data).recipeId,
                rootId: topComment.value.commentId,
                content: res.content,
                // 添加回复的评论id，以及回复的用户id
                toUserId: senderId,
                toCommentId: commentId
              }
              console.log('评论内容为：', comment)
              const result = await add(comment)
              // 更新评论信息
              updateList()
            },
            fail: (error) => { }
          })
        }


      } else if (res.cancel) {
        // 用户点击取消按钮的逻辑处理
      }
    }
  });
}

function updateList() {
  uni.getStorage({
    key: 'recipe',
    success: async ({ data }) => {
      const res = await getByTopComment(topComment.value.commentId, JSON.parse(data).recipeId)
      commentList.value = res.records
      // 将评论标识上是否是作者
      for (let index = 0; index < commentList.value.length; index++) {
        if (JSON.parse(data).authorId === commentList.value[index].senderId) {
          // 给这一项的isAuthor直接赋值为true(虽然原本数组上并没有这个值,但是这么写应该也没问题)
          commentList.value[index].isAuthor = true
        }
      }
    },
    fail: (error) => { }
  })
}


// 错了错了,应该判断的是
// 评论的发起id和当前用户id之间的关系
const deleteThis = async (commentId: number, senderId: number) => {
  // 拿用户id和这条评论的用户id做对比,如果一样则可以进行删除
  const res = await get()
  console.log('尝试删除评论')
  if (res.data.userId === senderId) {
    // 表示长按的人是长按评论的作者,则可以进行删除
    uni.showModal({
      title: '提示',
      content: '确定删除?',
      showCancel: true,
      success: async ({ confirm, cancel }) => {
        if (confirm) {
          // 进行删除
          const res = await deleteComment(commentId)
          // 更新评论列表
          // 评论列表是由菜谱页面获取后存入本地缓存,再有评论详情页面读取本地缓存得来的
          // 所以只能根据顶级评论重新获取一遍二级评论
          updateList()


        } else {
          console.log('取消删除')
        }
      }
    })
  }
}

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
.likeButton {
  height: 50rpx;
  width: 50rpx;
}


.commentListBox {
  margin-bottom: 40rpx;
}

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
  display: flex;
  align-items: center
}

.content {
  margin-left: 80rpx;
  font-size: 40rpx;
}

.andl .avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
}

.commentBox {
  margin: 50rpx 37.5rpx;
}
</style>