<template>

  <view class="title" v-if="favoritesInfo">
    <view style="font-size: 50rpx;">{{ favoritesInfo.name }}</view>
    <view>{{ favoritesInfo.intro }}</view>
  </view>

  <view class="favorites">


    <view class="resultList" v-for="(item, index) in recipeList" :key="item.recipeId">
      <view v-if="beginManage">
        <image @tap="selectIt(true, index)" v-if="!item.isSelected" class="selected"
          src="http://47.109.139.173:9000/food.guide/未选中weixuanhzong.png" mode="aspectFill" />
        <image @tap="selectIt(false, index)" v-else class="selected"
          src="http://47.109.139.173:9000/food.guide/选中youshizuo.png" mode="aspectFill" />
      </view>
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
  </view>

  <view class="bottom">-- 到底了 --</view>

  <!-- 底部操作栏 -->
  <view v-if="!beginManage" class="bottomButtons">
    <view @tap="manage" class="itemBox">
      <image src="http://47.109.139.173:9000/food.guide/%E6%95%B4%E7%90%862311.png" mode="aspectFill" />
      整理
    </view>
    <view @tap="edit" class="itemBox">
      <image src="http://47.109.139.173:9000/food.guide/编辑1231.png" mode="aspectFill" />编辑
    </view>
  </view>
  <!-- 底部操作栏-编辑状态 -->
  <view v-else class="bottomButtons">
    <view @tap="deleteItem" :class="{ disabled: selectedNumber <= 0 }" class="selectItemBox">删除
    </view>
    <view v-if="!isSelectAll" @tap="selectAll(true)" class="selectItemBox">全选
    </view>
    <view v-if="isSelectAll" @tap="selectAll(false)" class="selectItemBox">取消全选
    </view>
    <view class="selectItemBox" @tap="exitEdit">退出
    </view>
  </view>


  <uni-popup v-if="updateFavoritesData" ref="popup" background-color="#fff" type="bottom" border-radius="10px 10px 0 0">
    <view class="editTitle">
      <view class="cancelButton" @tap="cancelUpdate">取消</view>
      <view>编辑收藏</view>
      <view class="cancelButton" @tap="saveChange">保存</view>
    </view>
    <view class="editInput">
      <view>收藏标题</view>
      <input placeholder="请输入标题" type="text" v-model="updateFavoritesData.name">
    </view>
    <view class="editInput">
      <view>收藏描述</view>
      <input placeholder="请输入描述" type="text" v-model="updateFavoritesData.intro">
    </view>
    <view class="deleteBox">
      <view>管理</view>
      <view @tap="deleteFavorite" class="deleteButton">删除这个收藏</view>
    </view>
    <view style="width: 100%; margin-bottom: 400rpx;"></view>
  </uni-popup>


</template>

<!-- 整理这个功能,思路是这样的,首先设置一个变量,用于标识当前是否为整理状态,如果不是,则用户点击菜谱时,自动跳转至菜谱详情,如果是,则将该菜谱加入至选中列表中,并标识该菜谱 -->

<script lang="ts" setup>

import { onLoad } from '@dcloudio/uni-app';
import recipe from '@/service/recipe';
import favorite from '@/service/favorite';
import { ref } from 'vue';
const { getByRecipeId } = recipe()
const { deleteByFavoritesId, getById, getFavoritesInfo, updateFavorites, deleteBatch } = favorite()

let recipeList = ref([])
let favoritesInfo = ref()
let favoritesId = ref()
let beginManage = ref(false)
let popup = ref()
let updateFavoritesData = ref({
  name: '',
  intro: '',
  favoritesId: ''
})

let selectedNumber = ref(0)
let isSelectAll = ref(false)

const deleteFavorite = async () => {
  uni.showModal({
    title: '提示',
    content: '确定删除?',
    showCancel: true,
    success: async ({ confirm, cancel }) => {
      if (confirm) {
        const res = await deleteByFavoritesId(favoritesId.value)
        uni.showToast({
          title: '删除成功',
          icon: 'success',
          mask: true
        })
        popup.value.close()
        // 重定向到自定义收藏夹界面
        uni.switchTab({ url: '/pages/favorite/favorite' })
      }
    }
  })

}

function selectAll(ctrl: boolean) {

  if (ctrl) {
    // 全选
    recipeList.value.forEach(item => {
      item.isSelected = true
    })
    isSelectAll.value = true
    selectedNumber.value = recipeList.value.length
  } else {
    // 取消全选
    recipeList.value.forEach(item => {
      item.isSelected = false
    })
    isSelectAll.value = false
    selectedNumber.value = 0
  }
}

const deleteItem = async () => {
  if (selectedNumber.value > 0) {
    uni.showModal({
      title: '提示',
      content: '确认删除?',
      showCancel: true,
      success: async ({ confirm, cancel }) => {
        if (confirm) {
          // 将要删除的收藏菜谱id封装为一个数组
          let recipeIds = []
          recipeList.value.forEach(item => {
            if (item.isSelected) {
              recipeIds.push(item.recipeId)
            }
          })
          console.log('要删除的菜谱id集合:', recipeIds)
          const res = await deleteBatch(recipeIds)
          // 删除之后进行更新数据
          getRecipeListData(favoritesId.value)
          getFavoritesInfoData(favoritesId.value)
          beginManage.value = false
        }
      }
    })
  }
}

function selectIt(ctrl: boolean, index: number) {
  if (ctrl) {
    // 选中
    recipeList.value[index].isSelected = true
    selectedNumber.value++
  } else {
    // 取消选中
    recipeList.value[index].isSelected = false
    selectedNumber.value--
  }
  console.log(selectedNumber.value)
}

function exitEdit() {
  beginManage.value = false
}

const saveChange = async () => {
  updateFavoritesData.value.favoritesId = favoritesId.value
  const res = await updateFavorites(updateFavoritesData.value)
  uni.showToast({
    title: '修改成功',
    icon: 'success',
    mask: true
  })
  popup.value.close()
  getFavoritesInfoData(favoritesId.value)
}

const cancelUpdate = async () => {
  console.log('取消')
  popup.value.close()
}

function manage() {
  console.log('开始整理')
  beginManage.value = true
}

function edit() {
  console.log('开始编辑')
  // 拷贝一下数据
  updateFavoritesData.value = {
    name: favoritesInfo.value.name,
    intro: favoritesInfo.value.intro
  }
  popup.value.open()
}

let selectIfImg = ref('http://47.109.139.173:9000/food.guide/未选中.png')

onLoad(() => {
  uni.getStorage({
    key: 'favoritesId',
    success: (res) => {
      favoritesId.value = res.data
      getRecipeListData(favoritesId.value)
      getFavoritesInfoData(favoritesId.value)
    },
    fail: (error) => { }
  })
})

const toRecipeInfo = async (recipeId: number) => {
  const res = await getByRecipeId(recipeId)
  uni.setStorage({
    key: 'recipe',
    data: JSON.stringify(res.data)
  })
  uni.navigateTo({
    url: '/pages/recipe/recipe',
  })
}

const getRecipeListData = async (favoritesId: number) => {
  const res = await getById(favoritesId)
  recipeList.value = res.data
  // 给菜谱列表的每个值加上是否选中的标识
  recipeList.value.forEach(item => item.isSelected = false)
  console.log(recipeList.value)
}

// 还要获取收藏夹的信息
const getFavoritesInfoData = async (favoritesId: number) => {
  const res = await getFavoritesInfo(favoritesId)
  favoritesInfo.value = res.data
  uni.setNavigationBarTitle({
    title: favoritesInfo.value.name,
  })
}

</script>

<style scoped>
.deleteButton {
  font-size: 40rpx;
  color: black;
}

.deleteBox {
  color: grey;
  margin: 50rpx 37.5rpx;
}

.disabled {
  color: grey;
}

.selectItemBox {
  background-color: #e7e6e6;
  width: 150rpx;
  height: 60rpx;
  text-align: center;
  border-radius: 15rpx
}

.resultList .selected {
  width: 70rpx;
  height: 70rpx;
  margin-top: 60rpx;
}

.resultList {
  display: flex;
}

.editInput {
  margin: 50rpx 37.5rpx;
}

.editTitle {
  display: flex;
  justify-content: space-between;
  margin: 40rpx 37.5rpx;
  align-items: center;
}

.cancelButton {
  text-align: center;
  line-height: 75rpx;
  width: 150rpx;
  height: 75rpx;
  background-color: #cccccc78;
  border-radius: 15rpx;
}

.bottomButtons {
  width: 100%;
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0rpx;
}

.bottomButtons view {
  line-height: 100rpx;
  height: 100rpx;
}

.bottomButtons image {
  width: 50rpx;
  height: 50rpx;
  margin-right: 2rpx;
}

.itemBox {
  display: flex;
  align-items: center;
  margin-left: 14rpx;
}

.itemBox image {
  margin-right: 10rpx;
  width: 40rpx;
  height: 40rpx;
}

.bottom {
  text-align: center;
  color: gray;
}

.title {
  margin: 60rpx 30rpx;
}

.favorites {
  margin: 20rpx 30rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
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