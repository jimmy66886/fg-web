<template>
  <view v-if="recipe">

    <image @tap="showMore" class="moreCtrl" src="http://47.109.139.173:9000/food.guide/更多-white.png"></image>


    <image class="coverImg" :src="recipe.imageUrl" mode="aspectFill"></image>
    <view class="title">{{ recipe.title }}</view>
    <view class="otherInfo">
      <text>点赞数:{{ recipe.favoriteNumber }}</text>
      <text>浏览量:{{ recipe.views }}</text>
    </view>
    <view class="line"></view>
    <!-- 用户信息 -->
    <view class="userInfo">
      <image class="avatar" :src="recipe.avatarUrl" mode="aspectFill"></image>
      <text>{{ recipe.nickName }}</text>
      <button>关注</button>
    </view>
    <view class="line"></view>
    <!-- 用料 -->
    <view>
      <view class="materialsTitle">
        <text>用料</text>
        <button>丢进菜篮子</button>
      </view>
      <!-- 用料列表 -->
      <view class="line"></view>
      <view class="materialsList" v-for="item in recipe.materialsList" :key="item.materialsId">
        <view class="materialsItem">
          <text>{{ item.name }}</text>
          <text class="materialsAmount">{{ item.amount }}</text>
        </view>
      </view>
    </view>
    <!-- 步骤 -->
    <view style="margin-top: 30rpx;" v-for="item in recipe.recipeStepList" :key="item.recipeStepId">
      <view class="stepItem">
        <text style="font-size: 36rpx;
  font-weight: bold; margin-bottom: 30rpx;">步骤{{ item.stepNumber }}</text>
        <!-- 这种方式太蠢了,可以直接使用image的mode属性来调整的,不需要这么麻烦,mode属性可以定义拉伸裁切的效果 -->
        <!-- <view class="imageWrapper" :style="{ 'background-image': `url(${item.img})` }"
          @tap="previewImage(item.stepNumber)">
        </view> -->
        <image class="imageWrapper" :src="item.img" mode="aspectFill" @tap="previewImage(item.stepNumber)" />
        <text style="">{{ item.content }}</text>
      </view>
      <view class="line"></view>
    </view>
    <view class="bottomInfo">
      <text>菜谱创建于{{ recipe.createTime.split(' ')[0] }}</text>
      <text>菜谱更新于{{ recipe.updateTime.split(' ')[0] }}</text>
    </view>
  </view>
  <view class="bottomButtons">
    <!-- 底部操作栏 -->
    <button>收藏</button>
    <button>评论</button>
    <button open-type="share">分享</button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import user from '@/service/user';
import recipeAPI from '@/service/recipe';

const { get } = user()
const { removeById } = recipeAPI()

let recipe = ref()
getRecipe()

const showMore = async () => {
  // 先判断这个菜谱是不是自己的
  const res = await get()
  let itemList = ['点赞']
  // 拿res.data.userId和recipe里的authorId
  if (recipe.value.authorId == res.data.userId) {
    itemList.push('删除')
  }

  uni.showActionSheet({
    itemList: itemList,
    success: (res) => {
      if (!res.cancel) {
        const selectedIndex = res.tapIndex
        // 删除
        if (1 === selectedIndex) {
          // 清除本地用户数据
          uni.showModal({
            title: '提示',
            content: '确定删除?',
            showCancel: true,
            success: async (res) => {
              // 确定
              if (res.confirm) {
                console.log('菜谱id:', recipe.value.recipeId)
                const res = await removeById(recipe.value.recipeId)
                uni.showToast({
                  title: '删除成功',
                  icon: 'success',
                  mask: true
                })
                uni.navigateBack({ delta: 1 })
              }
            }
          })
        }

        // 点赞
        if (0 === selectedIndex) {
          console.log('点赞!')
        }

      }
    }
  })

}


function previewImage(stepNumber: number) {
  console.log(stepNumber)
  // 将这个步骤集合中的图片提取出一个图片地址数组
  let imgArr: any[] = []
  recipe.value.recipeStepList.forEach((element: { img: string; }) => {
    imgArr.push(element.img)
  });
  uni.previewImage({
    current: stepNumber - 1,
    urls: imgArr
  })
}

function getRecipe() {
  console.log('正在获取菜谱信息')
  uni.getStorage({
    'key': 'recipe',
    success: (res) => {
      recipe.value = JSON.parse(res.data)
      // 让步骤升序排序
      recipe.value.recipeStepList.sort((a: { stepNumber: number; }, b: { stepNumber: number; }) => a.stepNumber - b.stepNumber)
      uni.setNavigationBarTitle({
        title: recipe.value.title
      })
    },
  })
}
</script>

<style scoped>
/* 屏幕右上角显示的更多按钮 */
.moreCtrl {
  position: fixed;
  top: 40rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
}

.bottomButtons {
  display: flex;
  justify-content: space-between;
  position: fixed;
  bottom: 0rpx;
  text-align: center;
  background-color: white;
}

.bottomButtons button {
  line-height: 100rpx;
  width: 250rpx;
  height: 100rpx;
}

.bottomInfo {
  display: flex;
  flex-direction: column;
  margin-left: 37.5rpx;
  margin-right: 37.5rpx;
  padding-bottom: 100rpx;
}

.imageWrapper {
  width: 675rpx;
  height: 675rpx;
  /* 设置容器的上内边距为100%，使其高度与宽度相等 */
  /* background-size: cover; */
}

.stepItem {
  display: flex;
  flex-direction: column;
  margin-left: 37.5rpx;
  margin-right: 37.5rpx;
}

.stepItem text {}

.materialsItem {
  height: 80rpx;
  line-height: 80rpx;
  border-bottom: 1rpx solid #ccc;
}

.materialsAmount {
  position: absolute;
  right: 100rpx;
}

.materialsList {
  margin-left: 37.5rpx;
  margin-right: 37.5rpx;
  position: relative;
}

.materialsTitle {
  height: 80rpx;
  display: flex;
  margin-left: 37.5rpx;
  position: relative;
  font-size: 20px;
  line-height: 80rpx;
}

.materialsTitle button {
  position: absolute;
  right: 37.5rpx;
  height: 60rpx;
  font-size: 26rpx;
  line-height: 60rpx;
  top: 10rpx;
  border: 1rpx solid #5DB298;
}

.userInfo {
  display: flex;
  width: 100%;
  height: 100rpx;
  justify-content: left;
  line-height: 100rpx;
  position: relative;
}

.userInfo text {
  font-size: large;
}

.userInfo button {
  position: absolute;
  right: 37.5rpx;
  border: 1rpx solid #5DB298;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-left: 37.5rpx;
  margin-right: 30rpx;
}

.coverImg {
  width: 750rpx;
  height: 750rpx;
}

.title {
  text-align: center;
  font-size: 30px;
}

.otherInfo {
  text-align: center;
  display: flex;
  margin-top: 10px;
  justify-content: space-around;
}

.line {
  width: 90%;
  height: 1px;
  background-color: #ccc;
  margin: 0 auto;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}
</style>