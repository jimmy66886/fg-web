<template>
  <!-- 添加自定义食材的输入框 -->
  <view>
    <input @input="getSearchData" v-model.trim="searchCondition" class="search" type="text" placeholder="点此添加自定义食材">
  </view>
  <view class="searchResultBox" v-if="searchCondition.length !== 0">
    <view class="searchResultItem" v-for="(item, index) in searchResultList" :key="index"
      @tap="addSearchMaterialsToSelect(item)">
      <view style="padding-left: 20rpx;">{{ item }}
      </view>
      <view class="addItemButton">+</view>
    </view>
  </view>

  <!-- 当用户搜索食材时,这里会自动隐藏,和展示搜索结果的条件刚好相反即可 -->
  <view class="main" v-if="searchCondition.length === 0">
    <!-- 已选食材 -->
    <view class="selectCtrl">
      <view>已选食材</view>
      <view @tap="cleanSelected" class="clean" v-if="selectMaterials.length !== 0">清空</view>
    </view>
    <view class="showTips" v-if="selectMaterials.length === 0">
      <!-- 当已选食材为空时,显示的内容 -->
      看来你还没添加任何食材! <br>
      你可以通过上方的 输入框 自定义食材或者通过下方的 热门食材 点击添加
    </view>
    <view class="materialBox">
      <view class="materialItem" v-for="(item, index) in selectMaterials" :key="index" @tap="removeMaterial(item)">
        {{ item }}<text style="font-weight: bold;">×</text></view>
    </view>

    <button @tap="getResult" v-if="selectMaterials.length !== 0">匹配菜谱</button>

    <!-- 最近记录 -->
    <!-- 用户删除已选食材和清空的食材,都会进入到这个最近记录里 -->
    <!-- 且如果用户选择了某个历史记录中存在的食材,则该食材会从历史中删除 -->
    <!-- 2024年3月14日 23点18分 明天写!,这个要涉及到选择食材时对历史记录数组的操作 -->
    <view v-if="materialsHistory.length !== 0" class="selectCtrl">
      <view class="title">最近记录</view>
      <view v-if="materialsHistory.length !== 0" @tap="cleanHistory" class="clean">清空</view>
    </view>
    <view class="materialBox">
      <view @tap="addMaterialByHistory(item)" class="materialItem" v-for="item in materialsHistory">
        {{ item }}
      </view>
    </view>

    <view class="title">热门食材</view>
    <view class="materialBox">
      <view class="materialItem" @tap="addMaterial(item.name)" v-for="item in materials">
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>

import material from '@/service/material'
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';

let materials = ref([])

// 用于备份原始食材数组,便于在移除已选食材时,该食材可以回到原来的位置
let originalMaterials: any[] = []

let selectMaterials = ref([])

let materialsHistory = ref([])

let searchCondition = ref('')

let searchResultList = ref([])

const { getAll } = material()

function getResult() {
  // 将已选食材保存到本地缓存中
  uni.setStorage({
    key: 'selectedMaterials',
    data: JSON.stringify(selectMaterials.value),
  })
  uni.navigateTo({ url: '/pages/material/mateResult/mateResult' })
}

function getSearchData() {
  searchResultList.value = []
  // 根据搜索条件,在原始数组中查询匹配的食材,然后将这些食材放入到搜索结果数组中
  const condition = searchCondition.value
  for (let index = 0; index < originalMaterials.length; index++) {
    if (originalMaterials[index].name.includes(condition)) {
      searchResultList.value.unshift(originalMaterials[index].name)
    }
  }
  console.log('搜索结果为:', searchResultList.value)
}

function cleanSelected() {
  // 将已选的食材添加到历史记录数组中
  materialsHistory.value = [...selectMaterials.value, ...materialsHistory.value]
  // 清空已选数组
  selectMaterials.value = []
  // 将原始食材列表的值赋给食材列表
  materials.value = [...originalMaterials]
}

/**
 * 点击历史记录的食材,该食材会从历史记录中转移到已选食材中
 */
function addMaterialByHistory(name: string) {
  const index = materialsHistory.value.findIndex(item => item === name)
  if (index != -1) {
    // 找到了下标,进行移除
    materialsHistory.value.splice(index, 1)
    // 将食材添加到已选食材中
    selectMaterials.value.unshift(name)
  }
}

/**
 * 将搜索出的食材,添加到已选食材中,并且将该食材从食材列表和历史记录中删除
 */
function addSearchMaterialsToSelect(name: string) {
  // 点了就清空搜索列表
  addMaterial(name)
  searchResultList.value = []
  // 清空搜素框内容
  searchCondition.value = ''
}

/**
 * 清空历史记录,后期要进行持久化
 */
function cleanHistory() {
  materialsHistory.value = []
}

function addMaterial(name: string) {
  // 将该name的食材移除该数组
  const index = materials.value.findIndex(item => item.name === name)
  if (index !== -1) {
    // 存在该食材(其实一般都是存在的)
    // 移除食材列表中的食材
    materials.value.splice(index, 1)
    // 加入到已选食材中
    selectMaterials.value.push(name)
    // 移除历史记录中的该食材
    const ih = materialsHistory.value.findIndex(item => item === name)
    if (ih !== -1) {
      // 找到下标，然后移除
      materialsHistory.value.splice(ih, 1)
    }
  }
}

function removeMaterial(name: string) {
  // 将该name的食材移除该数组
  const index = selectMaterials.value.findIndex(item => item === name)
  if (index !== -1) {
    // 存在该食材(其实一般都是存在的)
    // 然后移除
    selectMaterials.value.splice(index, 1)
    // 然后将该食材放回到原来的位置
    // 先获取原位置
    let originalIndex = getOriginalIndex(name)
    console.log(name)
    materials.value.splice(originalIndex, 0, { name: name });

    // 将移除的食材添加到历史记录中
    materialsHistory.value.unshift(name)
  }
}

function getOriginalIndex(name: string) {
  return originalMaterials.findIndex(item => item.name === name)
}


const getAllData = async () => {
  const res = await getAll()
  materials.value = res.data
  originalMaterials = materials.value.slice()
}

onShow(() => {
  getAllData()
})
</script>

<style scoped>
.searchResultBox {
  display: flex;
  flex-direction: column;
  margin: 10rpx 37.5rpx;
}

.searchResultItem {
  margin-bottom: 10rpx;
  border-radius: 30rpx;
  width: 100%;
  height: 100rpx;
  background-color: gainsboro;
  line-height: 100rpx;
  display: flex;
  position: relative;
}

.searchResultItem .addItemButton {
  position: absolute;
  right: 30rpx;
  font-size: 50rpx;
  font-weight: bold;
}

.search {
  height: 80rpx;
  border: 1rpx solid gainsboro;
  padding-left: 20rpx;
  border-radius: 30rpx;
  margin-bottom: 50rpx;
  margin-top: 30rpx;
  margin-left: 37.5rpx;
  margin-right: 37.5rpx;
}

.showTips {
  color: #aaaaaa;
  text-align: center;
}

.selectCtrl {
  display: flex;
  font-size: large;
  position: relative;
}

.selectCtrl .clean {
  position: absolute;
  right: 0rpx;
}

.title {
  font-size: large;
  margin-bottom: 15rpx;
  margin-top: 50rpx;
}

.main {
  margin: 0 37.5rpx;
}

.materialItem {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: white;
  color: black;
  border-radius: 40rpx;
  margin-bottom: 10rpx;
  background-color: #e9e7e7;
  margin-right: 10rpx;
  /* 不指定每个食材的宽度,用字来撑开,然后在字的左右加上边距 */
  padding-left: 22rpx;
  padding-right: 22rpx;
}


.materialBox {
  display: flex;
  flex-wrap: wrap;
}
</style>