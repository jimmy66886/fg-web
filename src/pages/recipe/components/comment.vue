<template>
    <text style="font-size: 40rpx;">这道菜的评论</text>
    <view class="commentBox">
        <view class="commentItem" v-for="(item, index) in topComment">
            <!-- 头像,昵称,日期,点赞这四部分内容 -->
            <view class="andl">
                <image @tap="toUserInfo(item.senderId)" class="avatar" :src="item.senderAvatarUrl" mode="aspectFill" />
                <view>
                    <view @tap="toUserInfo(item.senderId)">{{ item.senderName }}<text
                            style="margin-left: 10rpx; color: green;" v-if="item.isAuthor">作者</text></view>
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
            </view>
            <!-- 评论内容 -->
            <view @longpress="deleteThis(item.commentId, item.senderId)" @tap="commentIt(item.commentId, item.senderId)"
                class="content">
                {{
                    item.content }}</view>
            <view v-if="item.expand" @tap="expand(index)" style="margin-left: 80rpx; color: skyblue;">展开</view>
        </view>
    </view>
</template>

<script lang="ts" setup>

import comment from '@/service/comment';
import emitter from '@/utils/emitter';
import { onShow, onLoad } from '@dcloudio/uni-app';
import { defineProps, ref } from 'vue'
import likes from '@/service/likes'
import user from '@/service/user';

const { getByRecipeId, getByTopComment, add, deleteComment } = comment()
const { addByCommentId, cancelCommentLike } = likes()
const { get } = user()

let content = ref('')

let topComment = ref([])

let { recipeId } = defineProps(['recipeId'])

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
        topComment.value.forEach(item => {
            if (item.commentId === commentId) {
                item.isLiked = true
                item.likeCount++
            }
        })
        console.log('点赞成功')
    } else {
        console.log('取消点赞：', commentId)
        const res = await cancelCommentLike(commentId)
        topComment.value.forEach(item => {
            if (item.commentId === commentId) {
                item.isLiked = false
                item.likeCount--
            }
        })
        console.log('取消点赞成功')
    }
}

const deleteThis = async (commentId: number, senderId: number) => {
    // 拿用户id和这条评论的用户id做对比,如果一样则可以进行删除
    const res = await get()
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
                    getCommentData()
                } else {
                    console.log('取消删除')
                }
            }
        })
    }
}

emitter.on('reload', (value: any) => {
    getCommentData()
})

function commentIt(commentId: number, senderId: number) {
    uni.showModal({
        title: '评论',
        content: '',
        editable: true,
        confirmText: '发送',
        cancelText: '取消',
        success: async (res) => {
            if (res.confirm) {
                if (res.content === '') {
                    uni.showToast({
                        title: '请输入评论内容',
                        icon: 'error',
                        mask: true
                    })
                    return
                }
                let comment = {
                    recipeId,
                    rootId: commentId,
                    content: res.content,
                    toUserId: senderId,
                    toCommentId: commentId
                }
                console.log('评论内容为：', comment)
                const result = await add(comment)
                // 更新评论信息
                getCommentData()
            } else if (res.cancel) {
                // 用户点击取消按钮的逻辑处理
            }
        }
    });

}

const getCommentData = async () => {
    const res = await getByRecipeId(recipeId)
    topComment.value = res.records
    uni.getStorage({
        key: 'recipe',
        success: ({ data }) => {
            for (let index = 0; index < topComment.value.length; index++) {
                if (topComment.value[index].senderId === JSON.parse(data).authorId) {
                    topComment.value[index].isAuthor = true
                }
                // 判断该顶级评论下是否有评论,如果没有则不展示"展开"选项
                if (topComment.value[index].replyNumber === 0) {
                    topComment.value[index].expand = false
                } else {
                    topComment.value[index].expand = true
                }
            }
        },
        fail: (error) => { }
    })
}

const expand = async (index: number) => {
    const res = await getByTopComment(topComment.value[index].commentId, recipeId)
    // 该顶级评论下的二级评论
    console.log(res.records)

    // 将该顶级评论和二级评论都存入本地缓存
    uni.setStorage({
        key: 'topComment',
        data: JSON.stringify(topComment.value[index]),
        success: (result) => {
            uni.setStorage({
                key: 'commentList',
                data: JSON.stringify(res.records),
                success: (result) => {
                    uni.navigateTo({ url: '/pages/recipe/commentDetail/commentDetail' })
                },
                fail: (error) => { }
            })
        },
        fail: (error) => { }
    })

}

getCommentData()

</script>

<style scoped>
.likeButton {
    height: 50rpx;
    width: 50rpx;
}

.commentItem {
    margin-bottom: 40rpx;
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
    margin-top: 50rpx;
}
</style>