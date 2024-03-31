<template>
  <scroll-view class="scroll-y" :scroll-top="scrollTop" scroll-y="true" @scrolltolower="loadMore">
    <view class="uploadRecipe">
      <image src="http://47.109.139.173:9000/food.guide/加icon.png" mode="scaleToFill" @tap="uploadRecipe" />
    </view>

    <!-- 轮播图 -->
    <view class="wrapImg">
      <swiper indicator-dots indicator-color="gray" indicator-active-color="white" autoplay circular>
        <swiper-item>
          <image src="http://47.109.139.173:9000/food.guide/早饭.jpg" mode="aspectFill" />
        </swiper-item>
        <swiper-item>
          <image src="http://47.109.139.173:9000/food.guide/DSC07300.jpg" mode="aspectFill" />
        </swiper-item>
        <swiper-item>
          <image src="http://47.109.139.173:9000/food.guide/jiaozi.jpg" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <view class="content">
      <view class="serach" @tap="toSearch">
        <image src="http://47.109.139.173:9000/food.guide/searchfg.png" mode="scaleToFill" />
        今天想做点什么?
      </view>
      <view class="oneWord">{{ wordStr }}</view>
    </view>

    <!-- 快捷分类 -->
    <view class="category">
      <view @tap="getCategoryInfo('家常菜')" class="categoryItem">
        <image src="http://47.109.139.173:9000/food.guide/家常菜.png" mode="scaleToFill" />
        <view>家常菜</view>
      </view>
      <view @tap="getCategoryInfo('快手菜')" class="categoryItem">
        <image src="http://47.109.139.173:9000/food.guide/快手菜.png" mode="scaleToFill" />
        <view>快手菜</view>
      </view>
      <view @tap="getCategoryInfo('热门菜')" class="categoryItem">
        <image src="http://47.109.139.173:9000/food.guide/热门菜.png" mode="scaleToFill" />
        <view>热门菜</view>
      </view>
      <view @tap="getCategoryInfo('下饭菜')" class="categoryItem">
        <image src="http://47.109.139.173:9000/food.guide/下饭菜.png" mode="scaleToFill" />
        <view>下饭菜</view>
      </view>
      <view @tap="toMoreCategory" class="categoryItem">
        <image src="http://47.109.139.173:9000/food.guide/更多.png" mode="scaleToFill" />
        <view>更多</view>
      </view>
    </view>

    <!-- 下面就是菜谱列表 -->
    <view class="recipeList">
      <view class="recipeItem" v-for="item in recipeList" :key="item.recipeId">
        <image @tap="toRecipeInfo(item.recipeId)" :src="item.imageUrl" mode="aspectFill" />
        <view>{{ item.title }}</view>
        <!-- <view>{{ item.nickName }}</view> -->
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">

import { ref, reactive } from 'vue'
import recipe from '@/service/recipe'
import { onShow } from '@dcloudio/uni-app';
import user from '@/service/user'

let wordStr = ref('')
let loadText = ref('上拉加载更多')
let pageSize = ref(10)
const { get } = user()
const { getRecipeList, getByRecipeId, getOneWord } = recipe()

const recipeList = ref([])

const loadMore = async () => {
  loadText.value = '加载中'
  pageSize.value += 10
  let arrLength = recipeList.value.length
  const res = await getRecipeList(pageSize.value)
  recipeList.value = res.records
  // 用于显示暂无更多的信息
  if (arrLength === recipeList.value.length) {
    loadText.value = '暂无更多'
  }
}

function uploadRecipe() {

  // 首页的加号可以加一个功能,就是扫一扫?或者就是识图
  uni.showActionSheet({
    itemList: ['上传菜谱', '识别菜品'],
    success: async ({ tapIndex }) => {
      if (tapIndex === 0) {
        // 上传菜谱
        uni.navigateTo({
          url: '/pages/uploadRecipe/uploadRecipe'
        })
      }
      if (tapIndex === 1) {

        // 先判断是否登录
        const userRes = await get()

        // 调用拍照/选择图片的api
        uni.chooseMedia({
          count: 1,
          mediaType: ['image'],
          success: (res) => {
            console.log('加载中')
            uni.showLoading({
              title: '加载中',
              mask: true
            })
            // 获取文件本地路径
            const { tempFilePath } = res.tempFiles[0]
            // 文件上传
            uni.uploadFile({
              url: 'http://192.168.137.1:8080/app/recipe/recognition',
              name: 'img',
              filePath: tempFilePath,
              success: (res) => {

                if (JSON.parse(res.data).code === 0) {
                  // 查询失败
                  uni.showToast({
                    title: JSON.parse(res.data).msg,
                    icon: 'error',
                    mask: true
                  })
                  uni.hideLoading()
                  return
                }

                console.log('加载完毕')
                uni.hideLoading()
                uni.setStorage({
                  key: 'recognitionResult',
                  data: res.data,
                  success: (result) => {
                    uni.navigateTo({ url: '/pages/index/recognition/recognition' })
                  },
                  fail: (error) => { }
                })
              }
            })
          }
        })
      }
    },
    fail: (error) => { }
  })
}

function getCategoryInfo(categoryName: string) {
  // 其实这个分类还是会跳转到搜索界面，不过是搜索条件变成了分类是该分类罢了
  //TODO 所以要先写搜索界面+搜索结果界面,这个就先放一放
  // 跳转过去，然后将分类名传过去，再调用搜索方法
  uni.setStorage({
    key: 'searchCondition',
    data: categoryName,
  })
  uni.navigateTo({
    url: '/pages/search/search',
  })
}

function toMoreCategory() {
  uni.navigateTo({
    url: '/pages/category/category'
  })
}

function toSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}

const getOneWordData = async () => {
  console.log('获取一言')
  const res = await getOneWord()
  wordStr.value = res.data.content
}

const getRecipeListData = async () => {
  console.log('开始分页获取菜谱列表')
  // 默认传10,也就是获取10个
  const res = await getRecipeList(pageSize.value)
  recipeList.value = res.records
}

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

onShow(() => {
  // 初始化数据
  getRecipeListData()
  getOneWordData()
})

</script>

<style scoped>
.scroll-y {
  height: 100vh;
}

.loadText {
  border-top: 2rpx solid rgba(0, 0, 0, 0.356);
  line-height: 60rpx;
  text-align: center;
  color: rgba(0, 0, 0, 0.356);
}

.uploadRecipe {
  margin-top: 90rpx;
  /* background-color: goldenrod; */
  margin-left: 10rpx;
}

.uploadRecipe image {
  width: 70rpx;
  height: 70rpx;
}

.categoryItem {
  width: 144rpx;
  height: 80rpx;
}

.categoryItem image {
  width: 40rpx;
  height: 40rpx;
}

.category {
  display: flex;
  margin: 20rpx 15rpx;
  height: 144rpx;
  justify-content: center;
  align-items: center;
}

.category view {
  text-align: center;
  width: 144rpx;
}

.oneWord {
  color: rgb(168, 166, 166);
  font-size: 30rpx;
  text-align: center;
  margin: 30rpx 37.5rpx;
}

.wrapImg {
  margin-right: 0rpx;
  background-color: green;
  height: 360rpx;
  margin-bottom: 20rpx;
}

.wrapImg swiper {
  height: 360rpx;
}

.wrapImg image {
  height: 360rpx;
  width: 750rpx;
}

.serach {
  display: flex;
  margin-left: 37.5rpx;
  margin-right: 37.5rpx;
  margin-bottom: 20rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  border: 1px solid black;
  box-shadow: #00000013 0px 0px 9px 6px;
  /* 让元素水平垂直居中 */
  justify-content: center;
  align-items: center;
  color: rgb(168, 166, 166);
}

.serach image {
  height: 50rpx;
  width: 50rpx;
}

.recipeList {
  /* background-color: #999999; */
  display: flex;
  flex-wrap: wrap;
}

.recipeItem {
  width: 50%;
  border: 5px solid rgb(255, 255, 255);
  overflow: hidden;
  box-sizing: border-box;
  font-size: 36rpx;
  font-weight: 400;
}

.recipeItem image {
  width: 350rpx;
  height: 340rpx;
  border-radius: 18px;
}
</style>
