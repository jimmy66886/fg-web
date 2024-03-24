<template>
  <view v-if="recipe">

    <image @tap="showMore" class="moreCtrl" src="http://47.109.139.173:9000/food.guide/更多-white.png"></image>


    <image class="coverImg" :src="recipe.imageUrl" mode="aspectFill"></image>
    <view class="title">{{ recipe.title }}</view>
    <view class="otherInfo">
      <text>收藏数:{{ recipe.favoriteNumber }}</text>
      <text>浏览量:{{ recipe.views }}</text>
    </view>
    <view class="line"></view>
    <!-- 用户信息 -->
    <view class="userInfo">
      <image class="avatar" :src="recipe.avatarUrl" mode="aspectFill"></image>
      <text>{{ recipe.nickName }}</text>
      <button>关注</button>
    </view>

    <view class="recipeIntro">{{ recipe.intro }}</view>

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
      <text id="scrollFlag" style="margin-bottom: 100rpx;">菜谱创建于{{ recipe.createTime.split(' ')[0] }}</text>
      <!-- <text id="scrollFlag" style="margin-bottom: 100rpx;">菜谱更新于{{ recipe.updateTime.split(' ')[0] }}</text> -->
      <comment :recipeId="recipe.recipeId"></comment>
    </view>
  </view>


  <view class="bottomButtons">
    <!-- 底部操作栏 -->
    <button v-if="!isFavorited" @tap="favoriteCtrl(true)">收藏</button>
    <button v-else @tap="favoriteCtrl(false)">已收藏</button>
    <button @tap="commentIt">评论</button>
    <button v-if="!isLiked" @tap="likeCtrl(true)">点赞</button>
    <button v-else @tap="likeCtrl(false)">已点赞</button>
  </view>


  <uni-popup ref="popup" background-color="#fff" type="bottom" border-radius="10px 10px 0 0">
    <!-- 用户点击收藏时,直接弹出用户的收藏夹,让用户选择收藏菜谱的位置,第一个可以是所有收藏,下方的就是用户自定义的收藏夹 -->
    <view class="favoriteCtrlTitle">
      <text>选择菜单</text>
      <view @tap="createFavorites">创建新菜单</view>
    </view>
    <view class="favoritesItem" @tap="addToFavorites(-1)">
      <image class="favoriteCover" src="http://47.109.139.173:9000/food.guide/folder.png" mode="aspectFit" />
      <view>所有收藏</view>
      <image class="favoriteIcon" src="http://47.109.139.173:9000/food.guide/3212132favorite.png" mode="aspectFit" />
    </view>
    <!-- 用户自定义收藏夹 -->
    <!-- 当用户点击收藏按钮后,立即收起收藏夹弹框,这样就不需要再做一个收藏成功的图标了 -->
    <view @tap="addToFavorites(item.favoritesId)" class="favoritesItem" v-for="item in favoritesList"
      :key="item.favoritesId">
      <image class="favoriteCover" :src="item.coverImg" mode="aspectFill" />
      <view>{{ item.name }}</view>
      <image class="favoriteIcon" src="http://47.109.139.173:9000/food.guide/3212132favorite.png" mode="aspectFit" />
    </view>
    <view style="margin-bottom: 100rpx;"></view>
  </uni-popup>

  <uni-popup ref="popup2" background-color="#fff" type="bottom" border-radius="10px 10px 0 0">
    <view class="createCtrl">
      <view @tap="cancelCreate">取消</view>
      <button @tap="createAndFavorite" :disabled="addFavoritesObj.name.length == 0">创建并收藏</button>
    </view>
    <view class="createFavoritesBox">
      <view>收藏夹标题</view>
      <textarea maxlength="10" v-model="addFavoritesObj.name" style="height: 200rpx; width:100%"
        placeholder="必填 · 10字以内"></textarea>
      <view>描述</view>
      <textarea maxlength="100" v-model="addFavoritesObj.intro" class="descr" placeholder="选填 · 100字以内"></textarea>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import user from '@/service/user';
import recipeAPI from '@/service/recipe';
import comment from './components/comment.vue';
import commentAPI from '@/service/comment';
import emitter from '@/utils/emitter';
import favorite from '@/service/favorite'
import likes from '@/service/likes';

const { add } = commentAPI()
const { get } = user()
const { removeById } = recipeAPI()
const { insertFavorites, addTo, getFavorited, deleteByRecipeId, getAllFavorites } = favorite()
const { getLiked, addByRecipeId, cancelLike } = likes()

let recipe = ref()

// 收藏夹弹出框
let popup = ref()

let popup2 = ref()

// 收藏夹列表
let favoritesList = ref([])

let reload = ref(true)

let isFavorited = ref(false)
let isLiked = ref(false)

let addFavoritesObj = ref({
  name: '',
  intro: '',
})

getRecipe()

const createAndFavorite = async () => {
  // 创建收藏夹并收藏该菜谱
  console.log('要创建的收藏夹：', addFavoritesObj.value)
  const res = await insertFavorites(addFavoritesObj.value)
  // res.data就是收藏夹id
  const resTwo = await addTo(res.data, recipe.value.recipeId)
  uni.showToast({
    title: '收藏成功',
    icon: 'success',
    mask: true
  })
  isFavorited.value = true
  popup.value.close()
  popup2.value.close()
}

function cancelCreate() {
  popup2.value.close()
}

function createFavorites() {
  popup2.value.open('bottom')
}

const likeCtrl = async (ctrl: boolean) => {
  if (ctrl) {
    console.log('进行点赞')
    const res = await addByRecipeId(recipe.value.recipeId)
    isLiked.value = true
    uni.showToast({
      title: '点赞成功',
      icon: 'success',
      mask: true
    })
  } else {
    const res = await cancelLike(recipe.value.recipeId)
    isLiked.value = false
    uni.showToast({
      title: '取消点赞成功',
      icon: 'success',
      mask: true
    })
  }
}

const favoriteCtrl = async (ctrl: boolean) => {
  if (ctrl) {
    console.log('进行收藏')
    // 弹出收藏夹弹框
    const res = await getAllFavorites()
    favoritesList.value = res.data
    popup.value.open('bottom')
  } else {
    // 先把取消收藏的操作写了

    uni.showModal({
      title: '提示',
      content: '确定移除收藏?',
      showCancel: true,
      success: async ({ confirm, cancel }) => {
        if (confirm) {
          const res = await deleteByRecipeId(recipe.value.recipeId)
          isFavorited.value = false
          uni.showToast({
            title: '取消收藏成功',
            icon: 'success',
            mask: true
          })
        }
      }
    })

  }
}


const addToFavorites = async (favoritesId: number) => {
  console.log('要添加到指定的收藏夹:', favoritesId)
  if (favoritesId === -1) {
    // 添加至所有收藏中
    const res = await addTo(null, recipe.value.recipeId)
  } else {
    // 添加到自定义收藏夹中
    const res = await addTo(favoritesId, recipe.value.recipeId)
  }
  uni.showToast({
    title: '收藏成功',
    icon: 'success',
    mask: true
  })
  isFavorited.value = true
  popup.value.close()
}

function commentIt() {
  uni.pageScrollTo({ selector: '#scrollFlag', duration: 300 })
  uni.showModal({
    title: '评论',
    content: '',
    editable: true,
    confirmText: '发送',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        let comment = {
          recipeId: recipe.value.recipeId,
          content: res.content
        }
        console.log('评论内容为：', comment)
        const result = await add(comment)
        // 更新一下数据？
        console.log('尝试更新评论数据')
        emitter.emit('reload', reload.value)
      } else if (res.cancel) {
        // 用户点击取消按钮的逻辑处理
      }
    }
  });

}

const showMore = async () => {
  // 先判断这个菜谱是不是自己的
  const res = await get()
  let itemList = ['烹饪模式']
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

        // 烹饪模式
        if (0 === selectedIndex) {
          console.log('烹饪模式启动!')
          uni.navigateTo({ url: '/pages/recipe/cookingMode/cookingMode' })
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
    success: async (res) => {
      recipe.value = JSON.parse(res.data)
      const favoriteRes = await getFavorited(recipe.value.recipeId)
      // 将用户是否收藏过该菜谱保存至isFavorited变量
      isFavorited.value = favoriteRes.data

      // 将用户是否点赞过该菜谱保存至isLiked变量
      const likeRes = await getLiked(recipe.value.recipeId)
      isLiked.value = likeRes.data

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
.createCtrl {
  display: flex;
  justify-content: space-between;
  margin: 40rpx 37.5rpx;
  position: relative;
  align-items: center;
}

.createCtrl button {
  position: absolute;
  right: 0;
}

.createFavoritesBox {
  margin: 50rpx 37.5rpx;
}

.createFavoritesBox .descr {
  height: 500rpx;
  width: 100%;
}

.allFavorite {
  margin: 0 37.5rpx;
}

.favoritesItem {
  margin: 10rpx 37.5rpx;
  line-height: 120rpx;
  display: flex;
  align-items: center;
  position: relative;
}

.favoritesItem .favoriteIcon {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  right: 0;
}

.favoritesItem .favoriteCover {
  width: 180rpx;
  height: 120rpx;
  border-radius: 30rpx;
  margin-right: 30rpx;
}

.favoriteCtrlTitle {
  margin: 10rpx 37.5rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favoriteCtrlTitle view {
  line-height: 80rpx;
  width: 200rpx;
  height: 80rpx;
  background-color: #F1F1F1;
  border-radius: 30rpx;
  text-align: center
}

.recipeIntro {
  margin: 20rpx 37.5rpx;
  line-height: 50rpx;
}

.commentBox {
  background-color: gold;
  width: 100%;
  height: 100rpx;
}

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