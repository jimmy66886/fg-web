<template>
  <view class="main">

    <!-- 添加自定义食材的输入框 -->
    <view>
      <input type="text" placeholder="点此添加自定义食材">
    </view>

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

    <button v-if="selectMaterials.length !== 0">匹配菜谱</button>

    <!-- 最近记录 -->
    <!-- 用户删除已选食材和清空的食材,都会进入到这个最近记录里 -->
    <!-- 且如果用户选择了某个历史记录中存在的食材,则该食材会从历史中删除 -->
    <!-- 2024年3月14日 23点18分 明天写!,这个要涉及到选择食材时对历史记录数组的操作 -->
    <view class="selectCtrl">
      <view class="title">最近记录</view>
      <view v-if="materialsHistory.length !== 0" @tap="cleanHistory" class="clean">清空</view>
    </view>
    <view class="materialBox">
      <view class="materialItem" v-for="item in materialsHistory">
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
import { ref } from 'vue';

let materials = ref([])

// 用于备份原始食材数组,便于在移除已选食材时,该食材可以回到原来的位置
let originalMaterials: any[] = []

let selectMaterials = ref([])

let materialsHistory = ref([])

const { getAll } = material()

function cleanSelected() {
  // 将已选的食材添加到历史记录数组中
  materialsHistory.value = [...materialsHistory.value, ...selectMaterials.value]
  // 清空已选数组
  selectMaterials.value = []
  // 将原始食材列表的值赋给食材列表
  materials.value = [...originalMaterials]
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
    materials.value.splice(index, 1)
    selectMaterials.value.push(name)
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

getAllData()

</script>

<style scoped>
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
  margin-top: 15rpx;
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
  background-color: #ccc;
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