<template>
    <text style="font-size: 40rpx;">这道菜的评论</text>
    <view class="commentBox">
        <view class="commentItem" v-for="(item, index) in topComment">
            <!-- 头像,昵称,日期,点赞这四部分内容 -->
            <view class="andl">
                <image :src="item.senderAvatarUrl" mode="aspectFill" />
                <view>
                    <view>{{ item.senderName }}<text style="margin-left: 10rpx; color: green;"
                            v-if="item.isAuthor">作者</text></view>
                    <view>{{ item.sendDateTime.split(' ')[0] }}</view>
                </view>
                <view class="like">点赞</view>
            </view>
            <!-- 评论内容 -->
            <view @longpress="deleteThis(item.commentId, item.senderId)" @tap="commentIt(item.commentId)"
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
import { onShow } from '@dcloudio/uni-app';
import { defineProps, ref } from 'vue'

const { getByRecipeId, getByTopComment, add, deleteComment } = comment()

let content = ref('')

let topComment = ref([])

let { recipeId } = defineProps(['recipeId'])

function deleteThis(commentId: number, senderId: number) {
    // 拿用户id和这条评论的用户id做对比,如果一样则可以进行删除
    uni.getStorage({
        key: 'recipe',
        success: ({ data }) => {
            if (JSON.parse(data).authorId === senderId) {
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
        },
        fail: (error) => { }
    })
}

emitter.on('reload', (value: any) => {
    getCommentData()
})

function commentIt(commentId: number) {
    uni.showModal({
        title: '评论',
        content: '',
        editable: true,
        confirmText: '发送',
        cancelText: '取消',
        success: async (res) => {
            if (res.confirm) {
                let comment = {
                    recipeId,
                    rootId: commentId,
                    content: res.content
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
    margin-top: 50rpx;
}
</style>