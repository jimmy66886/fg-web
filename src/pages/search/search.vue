<template>
  <view class="searchBox">
    <input v-model.trim="searchContent" @input="changeInputStatus" class="searchInput" type="text" placeholder="今天想做点什么?">
    <button plain="true" :disabled="searchAble" @tap="getSearchData">搜索</button>
  </view>
  <view class="line"></view>
  <!-- 搜索历史控件 -->
  <view v-if="!recipeList" class="searchHistory">
    <!-- 历史记录头部 -->
    <view class="title">
      <view>搜索历史</view>
      <view @tap="cleanHistoryData">清空</view>
    </view>
    <!-- 历史记录词条 -->
    <view class="historyBox">
      <view @tap="historySearch(item.content)" class="historyItem" v-for="item in searchData" :key="item.historyId">{{
      item.content }}</view>
    </view>
  </view>
  <!-- 搜索控件,综合/点赞/收藏,综合就是默认 -->
  <!-- 和搜索结果一块出 -->
  <view v-if="recipeList" class="searchCondition">
    <view :class="{ active: activeIndex === '' }" @tap="setQueryOrder('')">综合</view>
    <view :class="{ active: activeIndex === 'like_number' }" @tap="setQueryOrder('like_number')">点赞最高</view>
    <view :class="{ active: activeIndex === 'favorite_number' }" @tap="setQueryOrder('favorite_number')">收藏最多</view>
  </view>

  <view v-if="showMessage" class="showMessage">{{ showMessage }}</view>
  <!-- 搜索结果展示区 -->
  <view class="result" v-for="item in recipeList" :key="item.recipeId">
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
</template>

<script lang="ts" setup>

import recipe from '@/service/recipe'
import { onUnload } from '@dcloudio/uni-app';
import { ref } from 'vue'

const { cleanHistory, getRecipeByContional, getByRecipeId, getSearchHistory } = recipe()

let searchAble = ref(true)

let searchContent = ref('')

let recipeList = ref()

let orderBy = ref('')

// 当菜谱列表为空时,提示在页面的信息
let showMessage = ref('')

let activeIndex = ref('')

let searchData = ref([])

let recipeDto = ref({
  page: 1,
  pageSize: 10,
  orderBy: '',
  title: ''
})

function cleanHistoryData() {
  cleanHistory()
  searchData.value = []
}

// 设置排序条件
function setQueryOrder(value: string) {
  activeIndex.value = value
  orderBy.value = value
  getSearchData()
}

// 直接使用历史记录查询菜谱
function historySearch(content: string) {
  searchContent.value = content
  getSearchData()
}

function receive() {
  // 这个是主页传过来的搜索条件,也就是那几个分类
  console.log('尝试接收参数')
  uni.getStorage({
    'key': 'searchCondition',
    success: (res) => {
      if (res.data != '') {
        // 如果查询条件存在,则直接调用查询方法
        searchContent.value = res.data
        getSearchData()
      } else {
        console.log('参数为空!')
      }
    },
    fail: (fail) => {
      console.log('暂无参数')
    },
  })

}

onUnload(() => {
  console.log('清除分类名条件的缓存')
  uni.removeStorage({
    key: 'searchCondition',
  })
})

receive()

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

// 调用获取用户历史记录的接口
const getSearchHistoryData = async () => {
  const res = await getSearchHistory()
  searchData.value = res.data
}

getSearchHistoryData()


function changeInputStatus() {
  if (searchContent.value.length == 0) {
    // 表示输入框为空,则禁用搜索按钮
    searchAble.value = true
  } else {
    searchAble.value = false
  }
}

/**
 * 真正的搜索菜谱的方法
 */
const getSearchData = async () => {
  // 传入查询条件
  recipeDto.value.title = searchContent.value
  recipeDto.value.orderBy = orderBy.value
  const res = await getRecipeByContional(recipeDto.value)
  console.log('搜索结果为:', res.records, res.total)
  recipeList.value = res.records
  if (res.total == 0) {
    showMessage.value = '暂无数据'
  } else {
    showMessage.value = ''
  }
}

</script>

<style scoped>
.historyBox {
  display: flex;
  flex-wrap: wrap;
}

.historyItem {
  width: 150rpx;
  height: 80rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  line-height: 80rpx;
  text-align: center;
  margin-top: 10rpx;
  margin-bottom: 10rpx;
  margin-right: 10rpx;
}

.searchHistory .title {
  display: flex;
  justify-content: space-between;
  font-size: 30rpx;
  color: gray;
}

.searchHistory {
  margin: 10rpx 37.5rpx;
}

.active {
  font-weight: bold;
}

.showMessage {
  font-size: 50rpx;
  text-align: center;
  margin-top: 100rpx;
}

.line {
  height: 1px;
  background-color: #ccc;
  margin: 0 auto;
  margin-top: 10rpx;
  margin-bottom: 30rpx;
}

.searchCondition {
  display: flex;
  margin: 20rpx 37.5rpx;
  /* background-color: green; */
  justify-content: space-between;
}

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

.result {
  margin: 0 37.5rpx;
}

.searchBox {
  display: flex;
}

.searchInput {
  height: 100rpx;
  width: 500rpx;
  padding-left: 37.5rpx;
}

.searchBox button {
  height: 100rpx;
  width: 175rpx;
  font-size: 35rpx;
  line-height: 100rpx;
  background-color: white;
  border: none;
}
</style>