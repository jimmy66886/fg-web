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
            <view class="content">{{ item.content }}</view>
            <view @tap="expand(index)" style="margin-left: 80rpx; color: skyblue;">展开</view>
        </view>
    </view>
</template>

<script lang="ts" setup>

import comment from '@/service/comment';
import { onShow } from '@dcloudio/uni-app';
import { defineProps, ref } from 'vue'

const { getByRecipeId, getByTopComment } = comment()

let topComment = ref([])

let { recipeId } = defineProps(['recipeId'])

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

.commentItem{
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